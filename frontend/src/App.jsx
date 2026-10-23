import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Titulares from './components/Titulares';
import Inicio from './components/Inicio';
import News from './components/News';
import Footer from './components/Footer';
import Cultura from './components/Cultura';
import Turismo from './components/Turismo';
import Mundo from './components/Mundo';
import Pais from './components/Pais';
import Eventos from './components/Eventos';
import Deportes from './components/Deportes';
import Institucional from './components/Institucional';

import AuthProvider from './admin/AuthProvider';
import RequireAuth from './admin/RequireAuth';
import AdminLayout from './admin/AdminLayout';
import Login from './admin/pages/Login';
import NoticiasList from './admin/pages/NoticiasList';
import NoticiaForm from './admin/pages/NoticiaForm';

// Estructura común del portal público: header, ticker, contenido y footer.
function PortalLayout() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />
      <Titulares />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Panel del administrador: tiene su propio diseño y necesita sesión.
function AdminRoot() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PortalLayout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/cultura" element={<Cultura />} />
          <Route path="/noticia/:id" element={<News />} />
          <Route path="/turismo" element={<Turismo />} />
          <Route path="/mundo" element={<Mundo />} />
          <Route path="/pais" element={<Pais />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/deportes" element={<Deportes />} />
          <Route path="/institucional" element={<Institucional />} />
        </Route>

        <Route path="/admin" element={<AdminRoot />}>
          <Route path="login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="noticias" replace />} />
              <Route path="noticias" element={<NoticiasList />} />
              <Route path="noticias/nueva" element={<NoticiaForm key="nueva" />} />
              <Route path="noticias/:id/editar" element={<NoticiaForm key="editar" />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
