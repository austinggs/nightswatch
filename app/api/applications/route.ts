import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { applicationSchema } from "@/lib/schemas";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the form for errors.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const sb = createServiceClient();
    const user = await getCurrentUser();
    const { error } = await sb.from("applications").insert({
      ...parsed.data,
      previous_clan: parsed.data.previous_clan || null,
      social_username: parsed.data.social_username || null,
      gameplay_link: parsed.data.gameplay_link || null,
      user_id: user?.id ?? null
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
