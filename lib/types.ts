export type ClanRole = "owner" | "admin" | "moderator" | "member" | "trial";
export type ApplicationStatus = "pending" | "reviewing" | "tryout" | "accepted" | "rejected";
export type MatchStatus = "registration_open" | "full" | "upcoming" | "completed" | "cancelled";
export type EventType = "tournament" | "scrim" | "giveaway" | "training" | "clan_event";
export type EventStatus = "registration_open" | "full" | "upcoming" | "completed" | "cancelled";
export type RecruitmentStatus = "open" | "closed" | "limited";
export type UserRole = "admin" | "user";

export interface Settings {
  id: string;
  clan_name: string;
  clan_logo: string | null;
  clan_description: string;
  recruitment_status: RecruitmentStatus;
  clan_requirements: string;
  whatsapp_contact: string;
  whatsapp_group: string | null;
  social_links: Record<string, string> | null;
  updated_at: string;
}

export interface Member {
  id: string;
  user_id: string | null;
  username: string;
  blood_strike_uid: string;
  role: ClanRole;
  avatar_url: string | null;
  preferred_mode: string;
  join_date: string;
  bio?: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
  published_at: string;
  match_id: string | null;
  event_id: string | null;
  external_link: string | null;
}

export interface MatchItem {
  id: string;
  title: string;
  game_mode: string;
  match_date: string;
  start_time: string;
  registration_deadline: string;
  player_limit: number;
  rules: string;
  prize: string;
  status: MatchStatus;
  room_password: string | null;
  room_id: string | null;
  room_published: boolean;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  event_type: EventType;
  event_date: string;
  start_time: string;
  registration_deadline: string;
  rules: string;
  prize: string;
  participant_limit: number;
  status: EventStatus;
  created_at: string;
}

export interface Application {
  id: string;
  nickname: string;
  bs_username: string;
  bs_uid: string;
  preferred_mode: string;
  current_rank: string;
  previous_clan: string;
  experience: string;
  why_join: string;
  whatsapp_number: string;
  social_username: string | null;
  gameplay_link: string | null;
  status: ApplicationStatus;
  admin_note: string | null;
  submitted_at: string;
  user_id: string | null;
}

export interface MatchRegistration {
  id: string;
  match_id: string;
  user_id: string;
  username: string;
  bs_uid: string;
  registered_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  username: string;
  registered_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}
