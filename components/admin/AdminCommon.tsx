"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner, FormMessage, ConfirmDialog } from "@/components/ui/Common";
import type { ReactNode } from "react";

export function PageHeader({
  title, description, actions
}: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Modal({
  open, onClose, title, children, size = "md"
}: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: "sm" | "md" | "lg" }) {
  if (!open) return null;
  const w = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fadeIn" onClick={onClose}>
      <div className={`card w-full ${w} max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-bg-soft text-muted hover:text-white">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export { FormMessage, LoadingSpinner } from "@/components/ui/Common";

export function useAdminForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; description?: string; onConfirm: () => void; danger?: boolean } | null>(null);

  const submit = async (
    method: "POST" | "PATCH" | "DELETE",
    url: string,
    body?: any,
    successMsg = "Saved."
  ) => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "Request failed.");
      setMsg({ type: "success", message: successMsg });
      setTimeout(() => {
        router.refresh();
      }, 400);
      return { ok: true, data: d };
    } catch (err: any) {
      setMsg({ type: "error", message: err.message || "Request failed." });
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };

  return { loading, msg, setMsg, submit, confirm, setConfirm, router };
}

export function AdminForm({
  submitText, onSubmit, loading, msg, children, onSuccessText, danger
}: {
  submitText: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<boolean> | boolean;
  loading: boolean;
  msg: { type: "error" | "success"; message: string } | null;
  children: ReactNode;
  onSuccessText?: string;
  danger?: boolean;
}) {
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalSuccess(null);
    setLocalError(null);
    const ok = await onSubmit(e);
    if (ok && onSuccessText) {
      setLocalSuccess(onSuccessText);
      setTimeout(() => setLocalSuccess(null), 4000);
    }
  };

  const displayMsg = localSuccess
    ? { type: "success" as const, message: localSuccess }
    : localError
    ? { type: "error" as const, message: localError }
    : msg;

  return (
    <form onSubmit={submit} className="space-y-4">
      {displayMsg && <FormMessage type={displayMsg.type} message={displayMsg.message} />}
      {children}
      <button
        disabled={loading}
        className={danger ? "btn-danger w-full" : "btn-primary w-full"}
        type="submit"
      >
        {loading ? <LoadingSpinner size="sm" /> : submitText}
      </button>
    </form>
  );
}

export function ConfirmWrapper({
  confirm, onCancel
}: {
  confirm: { title: string; description?: string; onConfirm: () => void; danger?: boolean } | null;
  onCancel: () => void;
}) {
  if (!confirm) return null;
  return (
    <ConfirmDialog
      open
      title={confirm.title}
      description={confirm.description}
      onCancel={onCancel}
      danger={confirm.danger}
      confirmText="Confirm"
      onConfirm={() => { confirm.onConfirm(); onCancel(); }}
    />
  );
}
