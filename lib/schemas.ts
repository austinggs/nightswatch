import { z } from "zod";

export const applicationSchema = z.object({
  nickname: z.string().min(2).max(60),
  bs_username: z.string().min(2).max(60),
  bs_uid: z.string().min(3).max(40),
  preferred_mode: z.string().min(2).max(60),
  current_rank: z.string().min(1).max(60),
  previous_clan: z.string().max(120).optional().or(z.literal("")),
  experience: z.string().min(5).max(2000),
  why_join: z.string().min(5).max(2000),
  whatsapp_number: z.string().min(6).max(30),
  social_username: z.string().max(80).optional().or(z.literal("")),
  gameplay_link: z.string().url().optional().or(z.literal(""))
});

export const matchSchema = z.object({
  title: z.string().min(3).max(160),
  game_mode: z.string().min(2).max(80),
  match_date: z.string().min(1),
  start_time: z.string().min(1),
  registration_deadline: z.string().min(1),
  player_limit: z.coerce.number().int().min(1).max(500),
  rules: z.string().max(5000).optional().or(z.literal("")),
  prize: z.string().max(500).optional().or(z.literal("")),
  room_password: z.string().max(120).optional().or(z.literal("")),
  room_id: z.string().max(120).optional().or(z.literal("")),
  room_published: z.boolean().optional().default(false),
  status: z.enum(["registration_open", "full", "upcoming", "completed", "cancelled"])
});

export const eventSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().max(5000).optional().or(z.literal("")),
  event_type: z.enum(["tournament", "scrim", "giveaway", "training", "clan_event"]),
  event_date: z.string().min(1),
  start_time: z.string().min(1),
  registration_deadline: z.string().min(1),
  rules: z.string().max(5000).optional().or(z.literal("")),
  prize: z.string().max(500).optional().or(z.literal("")),
  participant_limit: z.coerce.number().int().min(1).max(2000),
  status: z.enum(["registration_open", "full", "upcoming", "completed", "cancelled"])
});

export const announcementSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(3).max(8000),
  cover_image: z.string().url().optional().or(z.literal("")),
  match_id: z.string().uuid().optional().or(z.literal("")),
  event_id: z.string().uuid().optional().or(z.literal("")),
  external_link: z.string().url().optional().or(z.literal(""))
});

export const memberSchema = z.object({
  username: z.string().min(2).max(60),
  blood_strike_uid: z.string().min(3).max(40),
  role: z.enum(["owner", "admin", "moderator", "member", "trial"]),
  avatar_url: z.string().url().optional().or(z.literal("")),
  preferred_mode: z.string().min(2).max(60),
  join_date: z.string().min(1),
  bio: z.string().max(1000).optional().or(z.literal("")),
  user_id: z.string().uuid().optional().or(z.literal(""))
});

export const settingsSchema = z.object({
  clan_name: z.string().min(2).max(60),
  clan_logo: z.string().url().optional().or(z.literal("")),
  clan_description: z.string().min(3).max(2000),
  recruitment_status: z.enum(["open", "closed", "limited"]),
  clan_requirements: z.string().max(3000).optional().or(z.literal("")),
  whatsapp_contact: z.string().min(2).max(240),
  whatsapp_group: z.string().url().optional().or(z.literal("")),
  social_links: z.record(z.string()).optional()
});

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const appStatusUpdateSchema = z.object({
  status: z.enum(["pending", "reviewing", "tryout", "accepted", "rejected"]),
  admin_note: z.string().max(3000).optional().or(z.literal(""))
});
