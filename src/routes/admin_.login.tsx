import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { adminAuth } from "@/lib/admin-auth";
import { TonaLogo } from "@/components/site/TonaLogo";

export const Route = createFileRoute("/admin_/login")({
  component: AdminLoginPage,
  head: () => ({ meta: [{ title: "Admin sign in — Tona Coffee" }] }),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "setup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "Tona Admin").trim();
    setBusy(true);
    try {
      const result =
        mode === "signin"
          ? await adminAuth.adapter.signIn.email({ email, password })
          : await adminAuth.adapter.signUp.email({ email, password, name });
      if (result.error)
        throw new Error(result.error.message ?? "Authentication failed.");
      toast.success(
        mode === "signin" ? "Welcome back." : "Admin account created.",
      );
      await navigate({ to: "/admin" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    const emailInput = document.querySelector<HTMLInputElement>(
      'input[name="email"]',
    );
    const email = emailInput?.value.trim().toLowerCase();
    if (!email) return toast.error("Enter your email address first.");
    setBusy(true);
    try {
      const result = await adminAuth.adapter.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (result.error)
        throw new Error(result.error.message ?? "Could not send reset email.");
      toast.success("Password reset instructions were sent to your email.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send reset email.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-sand lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-teal px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 leaf-field opacity-60" />
        <Link
          to="/"
          className="relative flex w-fit items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to website
        </Link>
        <div className="relative max-w-xl">
          <TonaLogo tone="light" size="xl" className="mb-10" />
          <p className="label-mono mb-5 text-primary">Tona operations</p>
          <h1 className="text-7xl font-black uppercase leading-[.82]">
            Everything Tona. One place.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/75">
            Manage coffee, events, customers and requests without losing the
            human touch.
          </p>
        </div>
        <p className="relative text-sm text-white/60">
          Secure access for approved Tona team members only.
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="brand-shadow mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <p className="label-mono text-primary">Admin dashboard</p>
          <h2 className="mt-3 text-4xl font-bold text-teal">
            {mode === "signin" ? "Welcome back" : "Set up your account"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {mode === "signin"
              ? "Sign in with your approved admin email and password."
              : "Create a password for an email already approved by Tona."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            {mode === "setup" && (
              <Field
                label="Full name"
                name="name"
                type="text"
                autoComplete="name"
                required
              />
            )}
            <Field
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <div>
              <label
                className="mb-2 block text-sm font-semibold text-teal"
                htmlFor="admin-password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  minLength={8}
                  required
                  className="h-12 w-full rounded-xl border bg-white px-4 pr-12 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-teal"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <button
              disabled={busy}
              className="h-12 w-full rounded-xl bg-primary text-sm font-bold text-white shadow-md shadow-orange-200 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {busy
                ? "Please wait…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create admin account"}
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={() =>
                setMode((value) => (value === "signin" ? "setup" : "signin"))
              }
              className="font-semibold text-teal hover:text-primary"
            >
              {mode === "signin"
                ? "First time? Set up account"
                : "Already set up? Sign in"}
            </button>
            {mode === "signin" && (
              <button
                type="button"
                disabled={busy}
                onClick={resetPassword}
                className="text-muted-foreground hover:text-primary"
              >
                Forgot password?
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Field(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string },
) {
  const { label, ...input } = props;
  return (
    <div>
      <label
        className="mb-2 block text-sm font-semibold text-teal"
        htmlFor={`admin-${input.name}`}
      >
        {label}
      </label>
      <input
        id={`admin-${input.name}`}
        {...input}
        className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
    </div>
  );
}
