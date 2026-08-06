"use client";

import { useState } from "react";
import { PageHeader, useAdminForm, AdminForm, FormMessage, LoadingSpinner } from "@/components/admin/AdminCommon";
import { settingsSchema } from "@/lib/schemas";
import type { Settings, RecruitmentStatus } from "@/lib/types";

export default function AdminSettingsClient({ settings }: { settings: Settings | null }) {
  const { loading, msg, submit } = useAdminForm();
  const [success, setSuccess] = useState<string | null>(null);

  const def = settings ?? {
    id: "singleton",
    clan_name: "Clan",
    clan_logo: "",
    clan_description: "",
    recruitment_status: "open" as RecruitmentStatus,
    clan_requirements: "",
    whatsapp_contact: "",
    whatsapp_group: "",
    social_links: {},
    updated_at: ""
  };
  const [socials, setSocials] = useState<Record<string, string>>(
    (def.social_links as Record<string, string>) || {}
  );
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  const addSocial = () => {
    const k = newKey.trim();
    const v = newVal.trim();
    if (!k) return;
    setSocials((s) => ({ ...s, [k]: v }));
    setNewKey(""); setNewVal("");
  };
  const removeSocial = (k: string) => {
    setSocials((s) => { const n = { ...s }; delete n[k]; return n; });
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      clan_name: fd.get("clan_name") as string,
      clan_logo: fd.get("clan_logo") as string,
      clan_description: fd.get("clan_description") as string,
      recruitment_status: fd.get("recruitment_status") as RecruitmentStatus,
      clan_requirements: fd.get("clan_requirements") as string,
      whatsapp_contact: fd.get("whatsapp_contact") as string,
      whatsapp_group: fd.get("whatsapp_group") as string,
      social_links: socials
    };
    const parsed = settingsSchema.safeParse(payload);
    if (!parsed.success) {
      const issue = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      alert(issue || "Please correct the form");
      return false;
    }
    const res = await submit("POST", "/api/settings", parsed.data, "Settings saved.");
    if (res.ok) setSuccess("Settings saved successfully.");
    setTimeout(() => setSuccess(null), 3500);
    return res.ok;
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Clan branding, recruitment, WhatsApp and socials — used across the whole site."
      />

      <form onSubmit={save} className="card space-y-5 max-w-3xl">
        {msg && <FormMessage type={msg.type} message={msg.message} />}
        {success && <FormMessage type="success" message={success} />}

        <div>
          <h3 className="font-display font-bold mb-3">Clan Branding</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label className="label">Clan Name *</label>
              <input required className="input" name="clan_name" defaultValue={def.clan_name} />
            </div>
            <div className="sm:col-span-1">
              <label className="label">Clan Logo URL</label>
              <input className="input" name="clan_logo" defaultValue={def.clan_logo || ""} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Clan Description *</label>
              <textarea required rows={4} className="textarea" name="clan_description" defaultValue={def.clan_description} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-display font-bold mb-3">Recruitment</h3>
          <div className="grid gap-4">
            <div>
              <label className="label">Recruitment Status *</label>
              <select className="select" name="recruitment_status" defaultValue={def.recruitment_status}>
                <option value="open">Open — accepting applications</option>
                <option value="limited">Limited — few spots left</option>
                <option value="closed">Closed — not accepting</option>
              </select>
            </div>
            <div>
              <label className="label">Clan Requirements</label>
              <textarea rows={4} className="textarea" name="clan_requirements" defaultValue={def.clan_requirements} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-display font-bold mb-3">WhatsApp</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">WhatsApp Contact (admin number or link) *</label>
              <input required className="input" name="whatsapp_contact" defaultValue={def.whatsapp_contact} placeholder="https://wa.me/1234567890 or +1234567890" />
              <div className="text-[11px] text-gray-500 mt-1">Used for all Contact Admin CTAs.</div>
            </div>
            <div>
              <label className="label">WhatsApp Group Invite Link</label>
              <input className="input" name="whatsapp_group" defaultValue={def.whatsapp_group || ""} placeholder="https://chat.whatsapp.com/..." />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-display font-bold mb-3">Social Links</h3>
          <div className="space-y-2">
            {Object.entries(socials).map(([k, v]) => (
              <div key={k} className="flex gap-2 items-center">
                <input className="input flex-[0_0_140px]" value={k} readOnly />
                <input className="input flex-1" value={v} readOnly />
                <button type="button" onClick={() => removeSocial(k)} className="btn-ghost text-xs">Remove</button>
              </div>
            ))}
            <div className="flex gap-2 items-center pt-2 border-t border-bg-border">
              <input
                className="input flex-[0_0_140px]"
                placeholder="Name (e.g. Instagram)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              <input
                className="input flex-1"
                placeholder="URL (https://...)"
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
              />
              <button type="button" onClick={addSocial} className="btn-secondary text-xs">Add</button>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-bg-border flex justify-end">
          <button disabled={loading} type="submit" className="btn-primary">
            {loading ? <LoadingSpinner size="sm" /> : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
