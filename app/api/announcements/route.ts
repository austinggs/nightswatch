import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { announcementSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = announcementSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const sb = createServiceClient();
    const payload = {
      ...parsed.data,
      cover_image: parsed.data.cover_image || null,
      match_id: parsed.data.match_id || null,
      event_id: parsed.data.event_id || null,
      external_link: parsed.data.external_link || null
    };
    const { data, error } = await sb.from("announcements").insert(payload).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
