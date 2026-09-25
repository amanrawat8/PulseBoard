import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apiClient } from "@/lib/api-client";
import { setAccessToken } from "@/lib/token-store";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // best-effort — clear local state regardless of server response
    }
    clearSession();
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.post<{ accessToken: string; user: User }>(
      "/auth/login",
      { email, password }
    );
    setAccessToken(response.data.accessToken);
    setUser(response.data.user);
  }, []);

  // On first mount, try to restore a session from the HttpOnly refresh
  // cookie (the access token itself only ever lives in memory, so it's
  // gone after a page reload even if the user is still "logged in").
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const refreshResponse = await apiClient.post<{ accessToken: string }>(
          "/auth/refresh"
        );
        if (cancelled) return;
        setAccessToken(refreshResponse.data.accessToken);

        const meResponse = await apiClient.get<{ user: User }>("/auth/me");
        if (cancelled) return;
        setUser(meResponse.data.user);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // The API client dispatches this when a refresh attempt fails mid-session
  // (e.g. the refresh token expired or was revoked elsewhere).
  useEffect(() => {
    function handleSessionExpired() {
      clearSession();
    }
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, isBootstrapping, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
