import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, signOut as apiSignOut } from "@/lib/auth.functions";

type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  company?: string;
  theme?: string;
  currency?: string;
  tariff_per_kwh?: number;
  notifications_enabled?: boolean;
};

type AuthCtx = {
  user: User | null;
  session: any | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
      setIsAdmin(u?.role === "admin");
    } catch (e) {
      console.error("Error fetching current user session:", e);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const signOut = async () => {
    await apiSignOut();
    setUser(null);
    setIsAdmin(false);
    window.location.href = "/";
  };

  return (
    <Ctx.Provider
      value={{ user, session: user ? {} : null, loading, isAdmin, signOut, refreshUser }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
