import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function POST(req: NextRequest, { params }: { params: { id: string; regId: string } }) {
  try {
    await requireAdmin();
    const sb = createServiceClient();
    const { error } = await sb
      .from("match_registrations")
      .delete()
      .eq("match_id", params.id)
      .eq("id", params.regId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { count } = await sb.from("match_registrations").select("*", { count: "exact", head: true }).eq("match_id", params.id);
    const { data: match } = await sb.from("matches").select("player_limit, status").eq("id", params.id).single();
    if (match && match.status === "full" && (count ?? 0) < match.player_limit) {
      await sb.from("matches").update({ status: "registration_open" }).eq("id", params.id);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
