import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({ username: z.string().min(2) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid username." }, { status: 400 });
    const sb = createServiceClient();
    const { data: ev, error: err1 } = await sb.from("events").select("*").eq("id", params.id).single();
    if (err1 || !ev) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    if (ev.status === "cancelled" || ev.status === "completed") return NextResponse.json({ error: "Registration is closed." }, { status: 400 });
    if (new Date(ev.registration_deadline) < new Date(new Date().toDateString())) return NextResponse.json({ error: "Registration deadline passed." }, { status: 400 });
    const { count, error: errCount } = await sb.from("event_registrations").select("*", { count: "exact", head: true }).eq("event_id", params.id);
    if (errCount) return NextResponse.json({ error: errCount.message }, { status: 500 });
    if ((count ?? 0) >= ev.participant_limit) return NextResponse.json({ error: "This event is full." }, { status: 400 });
    const { error } = await sb.from("event_registrations").insert({
      event_id: params.id, user_id: user.id, username: parsed.data.username
    });
    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "You are already registered." }, { status: 409 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if ((count ?? 0) + 1 >= ev.participant_limit) {
      await sb.from("events").update({ status: "full" }).eq("id", params.id);
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.message && String(e.message).includes("NEXT_REDIRECT")) throw e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
