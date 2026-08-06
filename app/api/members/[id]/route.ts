import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { memberSchema } from "@/lib/schemas";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = memberSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const sb = createServiceClient();
    const payload = {
      username: parsed.data.username,
      blood_strike_uid: parsed.data.blood_strike_uid,
      role: parsed.data.role,
      avatar_url: parsed.data.avatar_url || null,
      preferred_mode: parsed.data.preferred_mode,
      join_date: parsed.data.join_date,
      bio: parsed.data.bio || null,
      user_id: parsed.data.user_id || null
    };
    const { error } = await sb.from("members").update(payload).eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const sb = createServiceClient();
    const { error } = await sb.from("members").delete().eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
