import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({ role: z.enum(["admin", "user"]) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid role." }, { status: 400 });

    const sb = createServiceClient();

    // Guard: never let the last remaining admin demote themselves (or be
    // demoted), or the app would become permanently inaccessible without
    // a manual SQL fix.
    if (parsed.data.role === "user") {
      const { count, error: countErr } = await sb
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 });
      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          { error: "You can't remove the last remaining admin." },
          { status: 400 }
        );
      }
    }

    const { error } = await sb
      .from("user_profiles")
      .update({ role: parsed.data.role })
      .eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
