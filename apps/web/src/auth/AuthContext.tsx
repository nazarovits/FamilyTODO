import { createContext, useContext, useState, type ReactNode } from "react";

export interface AuthenticatedUser {
  id: string;
  email: string;
  profile: {
    displayName: string;
    role: string;
  } | null;
}

interface AuthContextValue {
  user: AuthenticatedUser | null;
  setUser: (user: AuthenticatedUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

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
