"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

const Context = createContext<{
  supabase: SupabaseClient;
  user: User | null;
  role: "admin" | "user" | null;
  refresh: () => Promise<void>;
} | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientBrowser());
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);

  const refresh = async () => {
    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u ?? null);
    if (u) {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", u.id)
        .maybeSingle();
      if (error) {
        // If this logs "infinite recursion detected in policy for relation
        // user_profiles", run supabase/migrations/0002_fix_admin_rls_and_rebrand.sql —
        // it replaces the recursive RLS policy that causes this.
        console.error("Failed to load user role:", error.message);
      }
      setRole((data?.role as "admin" | "user") ?? "user");
    } else {
      setRole(null);
    }
  };

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Context.Provider value={{ supabase, user, role, refresh }}>
      {children}
    </Context.Provider>
  );
}

export function useSupabase() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useSupabase must be used inside provider");
  return ctx;
}
