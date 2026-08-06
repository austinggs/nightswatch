import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({ username: z.string().min(2), bs_uid: z.string().min(3) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid username or UID." }, { status: 400 });

    const sb = createServiceClient();
    const { data: match, error: err1 } = await sb.from("matches").select("*").eq("id", params.id).single();
    if (err1 || !match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    if (match.status === "cancelled" || match.status === "completed") {
      return NextResponse.json({ error: "Registration is closed for this match." }, { status: 400 });
    }
    if (new Date(match.registration_deadline) < new Date(new Date().toDateString())) {
      return NextResponse.json({ error: "Registration deadline passed." }, { status: 400 });
    }

    const { count, error: errCount } = await sb
      .from("match_registrations")
      .select("*", { count: "exact", head: true })
      .eq("match_id", params.id);
    if (errCount) return NextResponse.json({ error: errCount.message }, { status: 500 });
    if ((count ?? 0) >= match.player_limit) {
      return NextResponse.json({ error: "This match is full." }, { status: 400 });
    }

    const { error } = await sb.from("match_registrations").insert({
      match_id: params.id,
      user_id: user.id,
      username: parsed.data.username,
      bs_uid: parsed.data.bs_uid
    });
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "You are already registered for this match." }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if ((count ?? 0) + 1 >= match.player_limit) {
      await sb.from("matches").update({ status: "full" }).eq("id", params.id);
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.message && String(e.message).includes("NEXT_REDIRECT")) throw e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
