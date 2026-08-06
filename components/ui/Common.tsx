"use client";

import { useEffect, useState } from "react";

export function FormMessage({ type, message }: { type: "error" | "success"; message: string }) {
  return (
    <div
      className={
        type === "error"
          ? "rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          : "rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300"
      }
    >
      {message}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  danger = false
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
      <div className="card w-full max-w-md">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        {description && <p className="mt-2 text-sm text-muted">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary">{cancelText}</button>
          <button onClick={onConfirm} className={danger ? "btn-danger" : "btn-primary"}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card text-center py-12">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bg-soft">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M9 12h6" />
        </svg>
      </div>
      <h4 className="font-display text-lg font-semibold">{title}</h4>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const w = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-5 w-5";
  return (
    <svg className={`animate-spin ${w} text-brand`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export function useFormSubmitState() {
  const [state, setState] = useState<{ type: "error" | "success"; message: string } | null>(null);
  useEffect(() => {
    if (!state) return;
    const t = setTimeout(() => setState(null), 6000);
    return () => clearTimeout(t);
  }, [state]);
  return { state, setState };
}
