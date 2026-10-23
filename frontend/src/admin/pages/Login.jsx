import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const destino = location.state?.desde || '/admin/noticias';
  if (usuario) return <Navigate to={destino} replace />;

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await login(email, password);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-[linear-gradient(180deg,#b91c1c_0_220px,#f3f4f6_220px)]">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="text-center mb-6">
          <img src="/img/LogoAlcaldia1.png" alt="Logo de la Alcaldía" className="h-20 w-auto mx-auto mb-3" />
          <h1 className="text-xl font-bold text-gray-800">Panel administrativo</h1>
          <p className="text-sm text-gray-500">Alcaldía del Municipio Rafael Rangel</p>
        </div>

        {error && (
          <div role="alert" className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={enviar} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-1">Correo electrónico</span>
            <input
              type="email" required autoFocus autoComplete="username" maxLength={190}
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-700"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</span>
            <input
              type="password" required autoComplete="current-password" maxLength={72}
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-700"
            />
          </label>
          <button
            type="submit" disabled={enviando}
            className="w-full bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white font-bold py-2.5 rounded-md cursor-pointer"
          >
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <Link to="/" className="block text-center text-sm text-gray-500 hover:text-red-700 mt-6">← Volver al portal</Link>
      </div>
    </div>
  );
}
