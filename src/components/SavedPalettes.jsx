import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../authContext';

export default function SavedPalettes() {
  const { user } = useAuth();
  const [palettes, setPalettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedColor, setCopiedColor] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchPalettes();
  }, [user]);

  const fetchPalettes = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'paletas'),
        where('uid', '==', user.uid),
        orderBy('criadoEm', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        criadoEm: doc.data().criadoEm?.toDate() || new Date()
      }));
      setPalettes(data);
    } catch (error) {
      console.error('Erro ao carregar paletas:', error);
      alert('Erro ao carregar paletas');
    } finally {
      setLoading(false);
    }
  };

  const deletePalette = async (paletteId, paletteName) => {
    if (!confirm(`Tem certeza que deseja excluir a paleta "${paletteName}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'paletas', paletteId));
      setPalettes(prev => prev.filter(p => p.id !== paletteId));
    } catch (error) {
      console.error('Erro ao excluir paleta:', error);
      alert('Erro ao excluir paleta');
    }
  };

  const copyToClipboard = async (color) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(''), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const copyPalette = async (colors) => {
    const paletteText = colors.join(', ');
    try {
      await navigator.clipboard.writeText(paletteText);
      alert('Paleta copiada! Cole onde precisar.');
    } catch (err) {
      console.error('Erro ao copiar paleta:', err);
    }
  };

  const getTextColor = (hexColor) => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">
            Você precisa estar logado para ver suas paletas salvas.
          </p>
          <a
            href="/login"
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 inline-flex items-center gap-2 font-semibold"
          >
            <span>🚀</span>
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">💾</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800">
              Minhas Paletas Salvas
            </h1>
          </div>
          <div className="flex items-center justify-center gap-4">
            <p className="text-gray-600 text-lg">
              {loading ? 'Carregando...' : `${palettes.length} paleta${palettes.length !== 1 ? 's' : ''} encontrada${palettes.length !== 1 ? 's' : ''}`}
            </p>
            <button
              onClick={fetchPalettes}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              Atualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando suas paletas...</p>
            </div>
          </div>
        ) : palettes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🎨</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Nenhuma paleta salva ainda
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Que tal criar sua primeira paleta de cores?
            </p>
            <a
              href="/"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 inline-flex items-center gap-2 font-semibold"
            >
              <span>➕</span>
              Criar Paleta
            </a>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {palettes.map((palette) => (
              <div key={palette.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
                {/* Header do cartão */}
                <div className="p-4 pb-2">
                  <h3 className="text-lg font-semibold text-gray-800 truncate" title={palette.nome}>
                    {palette.nome}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {palette.cores.length} {palette.cores.length === 1 ? 'cor' : 'cores'}
                  </p>
                </div>

                {/* Container das cores - altura fixa */}
                <div className="px-4 pb-4">
                  <div className="h-20 bg-gray-50 rounded-lg overflow-hidden border">
                    {palette.cores.length <= 5 ? (
                      // Layout horizontal para até 5 cores
                      <div className="flex h-full">
                        {palette.cores.map((cor, index) => (
                          <div
                            key={index}
                            className="flex-1 cursor-pointer hover:opacity-80 transition-opacity relative group"
                            style={{ backgroundColor: cor }}
                            title={cor}
                            onClick={() => copyToClipboard(cor)}
                          >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span 
                                className="text-xs font-medium px-1 py-0.5 rounded shadow-sm"
                                style={{ 
                                  backgroundColor: getTextColor(cor) === '#000000' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)',
                                  color: getTextColor(cor) === '#000000' ? '#000000' : '#ffffff'
                                }}
                              >
                                {copiedColor === cor ? '✓' : cor}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Layout em grade para mais de 5 cores
                      <div className="grid h-full" style={{ 
                        gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(palette.cores.length))}, 1fr)`,
                        gridTemplateRows: `repeat(${Math.ceil(palette.cores.length / Math.ceil(Math.sqrt(palette.cores.length)))}, 1fr)`
                      }}>
                        {palette.cores.map((cor, index) => (
                          <div
                            key={index}
                            className="cursor-pointer hover:opacity-80 transition-opacity relative group"
                            style={{ backgroundColor: cor }}
                            title={cor}
                            onClick={() => copyToClipboard(cor)}
                          >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span 
                                className="text-xs font-medium px-1 py-0.5 rounded shadow-sm"
                                style={{ 
                                  backgroundColor: getTextColor(cor) === '#000000' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)',
                                  color: getTextColor(cor) === '#000000' ? '#000000' : '#ffffff'
                                }}
                              >
                                {copiedColor === cor ? '✓' : ''}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer com ações */}
                <div className="px-4 pb-4">
                  <div className="flex justify-between items-center gap-2">
                    <button
                      onClick={() => copyPalette(palette.cores)}
                      className="flex-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors font-medium"
                    >
                      📋 Copiar Paleta
                    </button>
                    <button
                      onClick={() => deletePalette(palette.id, palette.nome)}
                      className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md transition-colors font-medium"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}