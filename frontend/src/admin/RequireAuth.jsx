import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth';

// Protege las rutas del panel: sin sesión, manda al login.
export default function RequireAuth() {
  const { usuario } = useAuth();
  const location = useLocation();

  if (usuario === undefined) {
    return <div className="min-h-screen grid place-items-center text-gray-500">Cargando…</div>;
  }
  if (!usuario) {
    return <Navigate to="/admin/login" replace state={{ desde: location.pathname + location.search }} />;
  }
  return <Outlet />;
}
