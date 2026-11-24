import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as auth from './authService.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    auth.restore().then((u) => on && setUser(u)).finally(() => on && setLoading(false));
    return () => { on = false; };
  }, []);

  const login = useCallback(async (username, password) => {
    const u = await auth.login(username, password);
    setUser(u);
    return u;
  }, []);
  const logout = useCallback(async () => { await auth.logout(); setUser(null); }, []);
  const refreshUser = useCallback(async () => {
    try { const u = await auth.restore(); setUser(u); } catch { /* keep current */ }
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, refreshUser }), [user, loading, login, logout, refreshUser]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
