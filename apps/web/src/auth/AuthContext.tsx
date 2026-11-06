import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthenticatedUserDto } from "@familytodo/shared-types";
import { getSession } from "./sessionApi";

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

interface AuthContextValue {
  user: AuthenticatedUserDto | null;
  status: AuthStatus;
  setUser: (user: AuthenticatedUserDto | null) => void;
  retrySession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUserDto | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [sessionAttempt, setSessionAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setStatus("loading");
    getSession(controller.signal).then(
      (session) => {
        if (controller.signal.aborted) {
          return;
        }

        setUser(session.user);
        setStatus(session.user ? "authenticated" : "unauthenticated");
      },
      (_error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setStatus("error");
      },
    );

    return () => controller.abort();
  }, [sessionAttempt]);

  const updateUser = useCallback((nextUser: AuthenticatedUserDto | null) => {
    setUser(nextUser);
    setStatus(nextUser ? "authenticated" : "unauthenticated");
  }, []);

  const retrySession = useCallback(() => {
    setStatus("loading");
    setSessionAttempt((attempt) => attempt + 1);
  }, []);

  const value = useMemo(
    () => ({ user, status, setUser: updateUser, retrySession }),
    [user, status, updateUser, retrySession],
  );

  return (
    <AuthContext.Provider value={value}>
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
