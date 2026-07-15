import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { register, getApiError, resendEmailVerification } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Project Camp" },
      { name: "description", content: "Create your Project Camp account." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [form, setForm] = useState({ email: "", username: "", fullName: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      await register(form);
      setRegistered(true);
      setInfo(
        `Verification email sent to ${form.email}. Open the link in your email to create your account, then sign in.`,
      );
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    setResendState("sending");
    setResendMsg(null);
    try {
      await resendEmailVerification(form.email);
      setResendState("sent");
      setResendMsg("Verification email sent. Check your inbox.");
    } catch (err) {
      setResendState("error");
      setResendMsg(getApiError(err));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-card-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Get started with Project Camp.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field
            label="Full name"
            value={form.fullName}
            onChange={set("fullName")}
            autoComplete="name"
          />
          <Field
            label="Username"
            value={form.username}
            onChange={set("username")}
            autoComplete="username"
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={set("email")}
            autoComplete="email"
          />
          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={set("password")}
            autoComplete="new-password"
          />

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>

          {registered && (
            <div className="rounded-md border border-border bg-background/50 p-3 text-sm">
              <p className="text-muted-foreground">Didn't get the email?</p>
              <button
                type="button"
                onClick={onResend}
                disabled={resendState === "sending"}
                className="mt-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent disabled:opacity-60"
              >
                {resendState === "sending" ? "Sending…" : "Resend verification email"}
              </button>
              {resendMsg && (
                <p
                  className={`mt-2 text-xs ${
                    resendState === "error" ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {resendMsg}
                </p>
              )}
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
