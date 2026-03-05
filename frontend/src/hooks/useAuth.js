import { useCallback } from "react";
import useChatStore from "../store/chatStore";

/**
 * Authentication hook wrapping the Zustand store's auth state.
 *
 * Provides login, register, logout, user profile, and role-checking
 * helpers for components throughout PozosPharma.
 *
 * @returns {{
 *   user: object | null,
 *   token: string | null,
 *   isAuthenticated: boolean,
 *   isPharmacist: boolean,
 *   isAdmin: boolean,
 *   login: (username: string, password: string) => Promise<object>,
 *   register: (username: string, email: string, password: string) => Promise<object>,
 *   logout: () => void,
 * }}
 */
export default function useAuth() {
  const user = useChatStore((s) => s.user);
  const token = useChatStore((s) => s.token);
  const storeLogin = useChatStore((s) => s.login);
  const storeRegister = useChatStore((s) => s.register);
  const storeLogout = useChatStore((s) => s.logout);

  const isAuthenticated = Boolean(user && token);
  const isPharmacist = isAuthenticated && (user?.role === "pharmacist" || user?.role === "admin");
  const isAdmin = isAuthenticated && user?.role === "admin";

  const login = useCallback(
    async (username, password) => {
      return storeLogin(username, password);
    },
    [storeLogin]
  );

  const register = useCallback(
    async (username, email, password) => {
      return storeRegister(username, email, password);
    },
    [storeRegister]
  );

  const logout = useCallback(() => {
    storeLogout();
  }, [storeLogout]);

  return {
    user,
    token,
    isAuthenticated,
    isPharmacist,
    isAdmin,
    login,
    register,
    logout,
  };
}
