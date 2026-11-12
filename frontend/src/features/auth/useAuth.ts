import { useContext } from "react";
import { AuthContext, type AuthContextType } from "./authContextDefinition";

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth trebuie utilizat în interiorul unui AuthProvider");
  }
  return context;
}

export default useAuth;
