import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

// { usuario, login, logout }. usuario es undefined mientras se consulta la sesión.
export function useAuth() {
  return useContext(AuthContext);
}

// ¿El rol del usuario tiene este permiso? Ej: puede(usuario, 'noticias.eliminar').
// El backend vuelve a comprobarlo; esto solo decide qué botones mostrar.
export function puede(usuario, codigo) {
  return Boolean(usuario?.permisos?.includes(codigo));
}
