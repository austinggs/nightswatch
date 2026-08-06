import { createClientCookies, createServiceClient } from "./supabase/server";
import { redirect } from "next/navigation";
import type { UserProfile } from "./types";

export async function getCurrentUser() {
  const sb = createClientCookies();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  return user;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) {
    return { id: user.id, email: user.email!, role: "user", created_at: user.created_at! };
  }
  return data as UserProfile;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/sign-in");
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data || data.role !== "admin") {
    redirect("/");
  }
  return user;
}

export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    const sb = createServiceClient();
    const { data } = await sb
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    return data?.role === "admin";
  } catch {
    return false;
  }
}
