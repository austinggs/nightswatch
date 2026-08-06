import { NextRequest, NextResponse } from "next/server";
import { createClientCookies } from "@/lib/supabase/server";

export async function POST(_req: NextRequest) {
  try {
    const sb = createClientCookies();
    await sb.auth.signOut();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
