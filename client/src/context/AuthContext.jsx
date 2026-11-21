import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api.js';
import { clearSession, getStoredUser, getToken, saveSession, saveUser } from '../utils/tokenStorage.js';

const AuthContext = createContext(null);

// Gives every component access to the logged-in user.
// The JWT lives in tokenStorage; the profile is kept here in React state.
export function AuthProvider({ children }) {
  // Start from the cached profile only if a token exists, so the navbar is correct immediately
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));

  // On first load, ask the server whether the stored token is still valid.
  // An expired or tampered token gets a 401, which the Axios interceptor handles.
  useEffect(() => {
    if (!getToken()) return;
    api
      .get('/auth/me')
      .then((profile) => {
        setUser(profile);
        saveUser(profile);
      })
      .catch(() => {
        /* 401 is handled by the interceptor; other errors keep the cached session */
      });
  }, []);

  // The interceptor fires this event when the server rejects the token
  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = (token, profile) => {
    saveSession(token, profile);
    setUser(profile);
  };

  // Logout is purely client-side: JWTs are stateless, so deleting the token ends the session
  const logout = () => {
    clearSession();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
