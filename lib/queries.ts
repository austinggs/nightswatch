import { createServiceClient } from "./supabase/server";
import type {
  Settings, Member, Announcement, MatchItem, EventItem, Application,
  MatchRegistration, EventRegistration, UserProfile
} from "./types";

export async function getSettings(): Promise<Settings | null> {
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("settings").select("*").maybeSingle();
    return data as Settings | null;
  } catch {
    return null;
  }
}

export async function getApprovedMembers(): Promise<Member[]> {
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("members").select("*").order("join_date", { ascending: false });
    return (data as Member[]) || [];
  } catch {
    return [];
  }
}

export async function getAllMembersAdmin(): Promise<Member[]> {
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("members").select("*").order("join_date", { ascending: false });
    return (data as Member[]) || [];
  } catch {
    return [];
  }
}

export async function getAnnouncements(limit = 20): Promise<Announcement[]> {
  try {
    const sb = createServiceClient();
    const { data } = await sb
      .from("announcements")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(limit);
    return (data as Announcement[]) || [];
  } catch {
    return [];
  }
}

export async function getLatestAnnouncement(): Promise<Announcement | null> {
  const list = await getAnnouncements(1);
  return list[0] || null;
}

export async function getMatches(): Promise<MatchItem[]> {
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("matches").select("*").order("match_date", { ascending: true });
    return (data as MatchItem[]) || [];
  } catch {
    return [];
  }
}

export async function getMatchById(id: string): Promise<MatchItem | null> {
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("matches").select("*").eq("id", id).maybeSingle();
    return data as MatchItem | null;
  } catch {
    return null;
  }
}

export async function getNextUpcomingMatch(): Promise<MatchItem | null> {
  try {
    const sb = createServiceClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await sb
      .from("matches")
      .select("*")
      .gte("match_date", today)
      .neq("status", "cancelled")
      .neq("status", "completed")
      .order("match_date", { ascending: true })
      .limit(1)
      .maybeSingle();
    return data as MatchItem | null;
  } catch {
    return null;
  }
}

export async function getEvents(): Promise<EventItem[]> {
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("events").select("*").order("event_date", { ascending: true });
    return (data as EventItem[]) || [];
  } catch {
    return [];
  }
}

export async function getEventById(id: string): Promise<EventItem | null> {
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("events").select("*").eq("id", id).maybeSingle();
    return data as EventItem | null;
  } catch {
    return null;
  }
}

export async function getNextUpcomingEvent(): Promise<EventItem | null> {
  try {
    const sb = createServiceClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await sb
      .from("events")
      .select("*")
      .gte("event_date", today)
      .neq("status", "cancelled")
      .neq("status", "completed")
      .order("event_date", { ascending: true })
      .limit(1)
      .maybeSingle();
    return data as EventItem | null;
  } catch {
    return null;
  }
}

export async function getApplications(): Promise<Application[]> {
  try {
    const sb = createServiceClient();
    const { data } = await sb
      .from("applications")
      .select("*")
      .order("submitted_at", { ascending: false });
    return (data as Application[]) || [];
  } catch {
    return [];
  }
}

export async function getApplicationById(id: string): Promise<Application | null> {
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("applications").select("*").eq("id", id).maybeSingle();
    return data as Application | null;
  } catch {
    return null;
  }
}

export async function getMatchRegistrations(matchId: string): Promise<MatchRegistration[]> {
  try {
    const sb = createServiceClient();
    const { data } = await sb
      .from("match_registrations")
      .select("*")
      .eq("match_id", matchId)
      .order("registered_at", { ascending: true });
    return (data as MatchRegistration[]) || [];
  } catch {
    return [];
  }
}

export async function getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
  try {
    const sb = createServiceClient();
    const { data } = await sb
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("registered_at", { ascending: true });
    return (data as EventRegistration[]) || [];
  } catch {
    return [];
  }
}

export async function isUserRegisteredForMatch(matchId: string, userId: string): Promise<boolean> {
  try {
    const sb = createServiceClient();
    const { data } = await sb
      .from("match_registrations")
      .select("id")
      .eq("match_id", matchId)
      .eq("user_id", userId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

export async function isUserRegisteredForEvent(eventId: string, userId: string): Promise<boolean> {
  try {
    const sb = createServiceClient();
    const { data } = await sb
      .from("event_registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("announcements").select("*").eq("id", id).maybeSingle();
    return data as Announcement | null;
  } catch {
    return null;
  }
}

export async function getMemberById(id: string): Promise<Member | null> {
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("members").select("*").eq("id", id).maybeSingle();
    return data as Member | null;
  } catch {
    return null;
  }
}

export async function getUserProfilesAdmin(): Promise<UserProfile[]> {
  try {
    const sb = createServiceClient();
    const { data } = await sb
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    return (data as UserProfile[]) || [];
  } catch {
    return [];
  }
}
