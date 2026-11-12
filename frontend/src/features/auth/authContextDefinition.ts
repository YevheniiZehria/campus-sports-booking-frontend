import { createContext } from "react";
import type { User } from "@/api/types";

export interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isBlocked: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

