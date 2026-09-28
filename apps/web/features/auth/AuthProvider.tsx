"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "@/services/api";
import type { AuthResponse, User } from "@/types";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<User>;
  register: (payload: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(usernameOrEmail, password) {
        const response: AuthResponse = await loginRequest(
          usernameOrEmail,
          password,
        );
        setUser(response.user);
        return response.user;
      },
      async register(payload) {
        const response = await registerRequest(payload);
        setUser(response.user);
        return response.user;
      },
      async logout() {
        await logoutRequest().catch(() => undefined);
        setUser(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
