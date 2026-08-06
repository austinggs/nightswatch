import { NextRequest, NextResponse } from "next/server";
import { createClientCookies } from "@/lib/supabase/server";
import { authSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = authSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }
    const sb = createClientCookies();
    const { error } = await sb.auth.signInWithPassword(parsed.data);
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
