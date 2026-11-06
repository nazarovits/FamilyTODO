import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthenticatedUserDto } from "@familytodo/shared-types";

interface AuthContextValue {
  user: AuthenticatedUserDto | null;
  setUser: (user: AuthenticatedUserDto | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUserDto | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
