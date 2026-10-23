import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';

export default function AdminLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const salir = async () => {
    await logout().catch(() => {});
    navigate('/admin/login', { replace: true });
  };

  const claseEnlace = ({ isActive }) =>
    `px-3 py-2 rounded-md font-semibold text-sm transition-colors ${
      isActive ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b-4 border-red-700 shadow-sm">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-4">
          <Link to="/admin/noticias" className="flex items-center gap-3 text-gray-800 font-bold">
            <img src="/img/LogoAlcaldia1.png" alt="" className="h-10 w-auto" />
            <span className="hidden sm:inline">Panel de la Alcaldía</span>
          </Link>

          <nav className="flex gap-1 flex-1">
            <NavLink to="/admin/noticias" className={claseEnlace}>Noticias</NavLink>
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <Link to="/" className="text-gray-500 hover:text-red-700">Ver sitio</Link>
            <span className="hidden md:inline font-semibold text-gray-800">{usuario.nombre}</span>
            <span className="bg-gray-100 text-gray-600 text-[11px] font-bold uppercase px-2 py-0.5 rounded-full">
              {usuario.rol}
            </span>
            <button
              onClick={salir}
              className="border border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-md font-semibold cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1300px] mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
