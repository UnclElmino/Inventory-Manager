import { createContext, useContext, useEffect, useState } from 'react';
import { getMe, logout as apiLogout } from '../lib/authApi';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getMe().then(u => setUser(u)).finally(() => setChecking(false));
  }, []);

  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  const loginWithFacebook = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/facebook`;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, checking, loginWithGoogle, loginWithFacebook, logout, setUser }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
