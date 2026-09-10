import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { adminAuth } from "@/lib/admin-auth";
import { TonaLogo } from "@/components/site/TonaLogo";

export const Route = createFileRoute("/admin_/reset-password")({
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Reset password — Tona Coffee" }] }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    const token =
      new URLSearchParams(window.location.search).get("token") ?? "";
    if (newPassword !== confirm) return toast.error("Passwords do not match.");
    if (!token) return toast.error("This reset link is invalid or expired.");
    setBusy(true);
    try {
      const result = await adminAuth.adapter.resetPassword({
        newPassword,
        token,
      });
      if (result.error)
        throw new Error(result.error.message ?? "Could not reset password.");
      toast.success("Password updated. You can now sign in.");
      await navigate({ to: "/admin/login" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not reset password.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="leaf-field flex min-h-screen items-center justify-center bg-teal-deep px-5 py-12">
      <div className="w-full max-w-md border-t-8 border-primary bg-sand p-7 shadow-2xl sm:p-10">
        <TonaLogo size="lg" className="mb-8" />
        <div className="brand-shadow mb-7 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
          <KeyRound className="h-7 w-7" />
        </div>
        <p className="label-mono text-primary">Admin security</p>
        <h1 className="mt-3 text-4xl font-bold text-teal">
          Choose a new password
        </h1>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <PasswordField name="password" label="New password" />
          <PasswordField name="confirm" label="Confirm password" />
          <button
            disabled={busy}
            className="brand-button h-12 w-full bg-primary font-bold text-white disabled:opacity-60"
          >
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
        <Link
          to="/admin/login"
          className="mt-6 block text-center text-sm font-semibold text-teal hover:text-primary"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}

function PasswordField({ name, label }: { name: string; label: string }) {
  return (
    <label className="block text-sm font-semibold text-teal">
      {label}
      <input
        name={name}
        type="password"
        minLength={8}
        required
        autoComplete="new-password"
        className="mt-2 h-12 w-full rounded-md border px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
    </label>
  );
}
