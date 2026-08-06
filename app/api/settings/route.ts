import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { settingsSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const sb = createServiceClient();
    const payload = {
      id: "singleton",
      clan_name: parsed.data.clan_name,
      clan_logo: parsed.data.clan_logo || null,
      clan_description: parsed.data.clan_description,
      recruitment_status: parsed.data.recruitment_status,
      clan_requirements: parsed.data.clan_requirements || "",
      whatsapp_contact: parsed.data.whatsapp_contact,
      whatsapp_group: parsed.data.whatsapp_group || null,
      social_links: parsed.data.social_links || {},
      updated_at: new Date().toISOString()
    };
    const { error } = await sb
      .from("settings")
      .upsert(payload, { onConflict: "id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
