import { useEffect, useState, ReactNode, useCallback } from "react";
import type { User, UserRole } from "@/api/types";
import { api } from "@/api/client";
import { mapeazaEroareApi } from "@/lib/erori";
import { AuthContext } from "./authContextDefinition";

const TOKEN_KEY = "usv_token";
const USER_KEY = "usv_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem(USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as User;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.GET("/users/me");
      if (res.data) {
        setUser(res.data);
        sessionStorage.setItem(USER_KEY, JSON.stringify(res.data));
      } else if (res.error) {
        logout();
      }
    } catch {
      // Ignorăm erori tranzitorii de rețea
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.POST("/auth/login", {
        body: { email: email.trim(), password },
      });

      if (res.error) {
        return { success: false, error: mapeazaEroareApi(res.error) };
      }

      if (res.data?.accessToken) {
        const receivedToken = res.data.accessToken;
        setToken(receivedToken);
        sessionStorage.setItem(TOKEN_KEY, receivedToken);

        const meRes = await api.GET("/users/me", {
          headers: { Authorization: `Bearer ${receivedToken}` },
        });

        if (meRes.data) {
          setUser(meRes.data);
          sessionStorage.setItem(USER_KEY, JSON.stringify(meRes.data));
        }

        return { success: true };
      }

      return { success: false, error: "Răspunsul de autentificare nu a inclus un token valid." };
    } catch (err) {
      return { success: false, error: mapeazaEroareApi(err) };
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.POST("/auth/register", {
        body: {
          email: data.email.trim(),
          password: data.password,
          fullName: data.fullName.trim(),
          phone: data.phone?.trim() || undefined,
        },
      });

      if (res.error) {
        return { success: false, error: mapeazaEroareApi(res.error) };
      }

      return await login(data.email, data.password);
    } catch (err) {
      return { success: false, error: mapeazaEroareApi(err) };
    }
  };

  const role: UserRole | undefined = user?.role as UserRole | undefined;
  const isAdmin = role === "administrator";
  const isStudent = role === "student";
  const isTeacher = role === "profesor";
  const isBlocked = Boolean(user?.isBlocked);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isAdmin,
        isStudent,
        isTeacher,
        isBlocked,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
