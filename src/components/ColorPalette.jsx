import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../authContext';
import { toast } from "sonner"; // ou outro sistema de toast que esteja usando

function generateRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default function ColorPalette() {
  const [colors, setColors] = useState(() =>
    Array.from({ length: 5 }, (_, index) => ({
      hex: generateRandomColor(),
      id: Date.now() + index,
      locked: false
    }))
  );
  const [paletteCount, setPaletteCount] = useState(5);
  const [copiedColor, setCopiedColor] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Função para gerar nova paleta
  const generateNewPalette = () => {
    const newColors = [];
    for (let i = 0; i < paletteCount; i++) {
      newColors.push({
        hex: generateRandomColor(),
        id: Date.now() + i,
        locked: false
      });
    }
    setColors(newColors);
  };

  // Função para regenerar apenas cores não travadas
  const regenerateUnlocked = () => {
    setColors(prev => prev.map(color => 
      color.locked ? color : { ...color, hex: generateRandomColor() }
    ));
  };

  // Função para alternar lock de cor
  const toggleLock = (colorId) => {
    setColors(prev => prev.map(color => 
      color.id === colorId ? { ...color, locked: !color.locked } : color
    ));
  };

  // Função para copiar cor para clipboard
  const copyToClipboard = async (color) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(''), 2000);
    } else {
      const fallback = window.prompt("Copie o código da cor:", color);
      if (fallback !== null) {
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(''), 2000);
      }
    }
  } catch (err) {
    console.error('Erro ao copiar:', err);
    alert(`Copiado: ${color}`);
  }
};

  // Função para calcular contraste do texto
  const getTextColor = (hexColor) => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  // Função para salvar paleta
  const savePalette = async () => {
    if (!user) {
      alert('Você precisa estar logado para salvar paletas.');
      return;
    }

    if (colors.length === 0) {
      alert('Gere uma paleta primeiro!');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "paletas"), {
        nome: `Paleta ${new Date().toLocaleDateString()}`,
        cores: colors.map(c => c.hex),
        criadoEm: new Date(),
        uid: user.uid
      });
      toast.success("Paleta salva com sucesso!");
    } catch (e) {
      console.error("Erro ao salvar paleta: ", e);
      toast.error("Erro ao salvar paleta.");
    } finally {
      setLoading(false);
    }
  };

  // Atualizar cores quando o número mudar
  React.useEffect(() => {
  setColors(prev => {
    if (prev.length !== paletteCount) {
      return Array.from({ length: paletteCount }, () => ({
        hex: generateRandomColor(),
        id: crypto.randomUUID(),
        locked: false
      }));
    }
    return prev;
  });
}, [paletteCount]);


  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🎨</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800">
              Gerador de Paleta de Cores
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Crie paletas de cores incríveis para seus projetos
          </p>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">Quantidade de cores:</span>
                <select 
                  value={paletteCount} 
                  onChange={(e) => setPaletteCount(Number(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={3}>3 cores</option>
                  <option value={4}>4 cores</option>
                  <option value={5}>5 cores</option>
                  <option value={6}>6 cores</option>
                  <option value={8}>8 cores</option>
                </select>
              </label>
            </div>
            
            <div className="flex gap-3">
  <button
    onClick={regenerateUnlocked}
    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
    title="Regenera apenas cores não travadas"
  >
    <span className="text-lg" role="img" aria-hidden="true">🔄</span>
    Regenerar
  </button>
  
  <button
    onClick={generateNewPalette}
    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
    title="Gera uma nova paleta completa"
  >
    <span className="text-lg" role="img" aria-hidden="true">🎲</span>
    Nova Paleta
  </button>
  
  {user && (
    <button
      onClick={savePalette}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
      aria-label={loading ? "Salvando paleta" : "Salvar paleta"}
      disabled={loading}
    >
      {loading ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" aria-hidden="true"></div>
          Salvando...
        </>
      ) : (
        <>
          <span className="text-lg" role="img" aria-hidden="true">💾</span>
          Salvar
        </>
      )}
    </button>
  )}
</div>
          </div>
        </div>

        {/* Paleta Principal */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-0">
            {colors.map((color) => (
              <div
                key={color.id}
                className="relative group h-48 cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
                style={{ backgroundColor: color.hex }}
                onClick={() => copyToClipboard(color.hex)}
              >
                {/* Overlay com informações */}
                <div 
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex flex-col items-center justify-center"
                  style={{ color: getTextColor(color.hex) }}
                >
                  <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {copiedColor === color.hex ? (
                      <div className="flex items-center gap-2 bg-black bg-opacity-50 rounded-lg px-3 py-2">
                        <span className="text-lg">✅</span>
                        <span className="text-sm font-medium">Copiado!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-black bg-opacity-50 rounded-lg px-3 py-2">
                        <span className="text-lg">📋</span>
                        <span className="text-sm font-medium">Clique para copiar</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Botão de Lock */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(color.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                      color.locked 
                        ? 'bg-yellow-500 text-white shadow-lg transform scale-110' 
                        : 'bg-gray-700 bg-opacity-50 text-white opacity-0 group-hover:opacity-100'
                    } hover:scale-125`}
                      title={color.locked ? 'Cor travada - Clique para destravar' : 'Clique para travar esta cor'}
                      aria-label={color.locked ? 'Destravar cor' : 'Travar cor'}
                  >
                    <span className="text-sm">
                      {color.locked ? '🔒' : '🔓'}
                    </span>
                  </button>
                </div>
                
                {/* Código da cor */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div 
                    className="text-center font-mono font-bold text-lg tracking-wider"
                    style={{ 
                      color: getTextColor(color.hex),
                      textShadow: color.locked ? '0 0 8px rgba(255,255,255,0.8)' : 'none'
                    }}
                  >
                    {color.hex.toUpperCase()}
                  </div>
                  {color.locked && (
                    <div className="text-center mt-1">
                      <span 
                        className="text-xs font-medium px-2 py-1 bg-yellow-500 text-yellow-900 rounded-full"
                      >
                        TRAVADA
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dicas */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span className="text-xl">💡</span>
            Dicas de Uso:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700 text-sm">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span>🎯</span>
                <span>Clique em uma cor para copiar o código hexadecimal</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🔒</span>
                <span>Use o cadeado para travar cores que você gosta</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🔄</span>
                <span>Regenerar mantém as cores travadas intactas</span>
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span>💾</span>
                <span>Salve suas paletas favoritas para usar depois</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🎨</span>
                <span>Ajuste a quantidade de cores conforme sua necessidade</span>
              </li>
              <li className="flex items-start gap-2">
                <span>👆</span>
                <span>Passe o mouse sobre as cores para ver as opções</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}