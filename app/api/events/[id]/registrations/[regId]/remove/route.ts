import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string; regId: string } }) {
  try {
    await requireAdmin();
    const sb = createServiceClient();
    const { error } = await sb
      .from("event_registrations")
      .delete()
      .eq("event_id", params.id)
      .eq("id", params.regId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { count } = await sb.from("event_registrations").select("*", { count: "exact", head: true }).eq("event_id", params.id);
    const { data: ev } = await sb.from("events").select("participant_limit, status").eq("id", params.id).single();
    if (ev && ev.status === "full" && (count ?? 0) < ev.participant_limit) {
      await sb.from("events").update({ status: "registration_open" }).eq("id", params.id);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
