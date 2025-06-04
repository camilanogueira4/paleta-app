// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ColorPalette from './components/ColorPalette';
import SavedPalettes from './components/SavedPalettes';
import Login from './components/Login';
import { AuthProvider } from './authContext';
import { useAuth } from './authContext';
import { getAuth, signOut } from 'firebase/auth';

function NavBar() {
  const { user } = useAuth();
  const auth = getAuth();

  return (
    <nav className="bg-gray-100 shadow p-4 flex justify-between items-center mb-6">
      <div className="space-x-4">
        <Link to="/" className="text-blue-600 hover:underline">Nova Paleta</Link>
        <Link to="/salvas" className="text-blue-600 hover:underline">Paletas Salvas</Link>
      </div>
      <div className="space-x-4">
        {user ? (
          <>
            <span className="text-gray-800">Olá, {user.displayName || user.email}</span>
            <button
              onClick={() => signOut(auth)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Sair
            </button>
          </>
        ) : (
          <Link to="/login" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Login</Link>
        )}
      </div>
    </nav>
  );
}


function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<ColorPalette />} />
          <Route path="/salvas" element={<SavedPalettes />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
