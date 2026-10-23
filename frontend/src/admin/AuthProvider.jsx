import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, onSesionExpirada } from './api';
import { AuthContext } from './auth';

export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(undefined);

  useEffect(() => {
    onSesionExpirada(() => setUsuario(null));
    api('/auth/me')
      .then((data) => setUsuario(data.usuario))
      .catch(() => setUsuario(null));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    setUsuario(data.usuario);
  }, []);

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' });
    setUsuario(null);
  }, []);

  const valor = useMemo(() => ({ usuario, login, logout }), [usuario, login, logout]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
