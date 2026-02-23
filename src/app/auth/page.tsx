"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { PremiumCard, SectionShell } from "@/components/ultra/section";

type Mode = "login" | "register";

type AuthResponse = {
  ok?: boolean;
  message?: string;
  user?: {
    name?: string;
    roles?: string[];
  };
};

function resolveDestination(roles: string[] | undefined): string {
  const safeRoles = roles ?? [];
  if (safeRoles.includes("super_admin") || safeRoles.includes("admin")) {
    return "/admin";
  }
  if (safeRoles.includes("photographer")) {
    return "/photographer";
  }
  return "/portal";
}

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : {
              email,
              password,
              name,
              phone: phone || undefined,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.ok) {
        setMessage(data.message ?? "Authentication failed.");
        return;
      }

      setMessage(`Welcome back, ${data.user?.name ?? "member"}! Redirecting...`);
      router.push(resolveDestination(data.user?.roles));
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell path="/auth">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra max-w-xl">
          <PremiumCard>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`focus-luxury rounded-full border px-4 py-2 text-sm ${mode === "login" ? "border-primary bg-primary text-primary-foreground" : "border-border/70 text-muted-foreground"}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`focus-luxury rounded-full border px-4 py-2 text-sm ${mode === "register" ? "border-primary bg-primary text-primary-foreground" : "border-border/70 text-muted-foreground"}`}
              >
                Register
              </button>
            </div>

            <h1 className="mt-4 text-3xl">{mode === "login" ? "Member Sign In" : "Create Account"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your email and password to access the member portal. Permissions decide whether you land in customer,
              photographer, or admin workspace.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {mode === "register" ? (
                <label className="block text-sm">
                  <span className="mb-2 block text-muted-foreground">Name</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="focus-luxury h-11 w-full rounded-xl border border-border/70 bg-background/30 px-3"
                    required
                  />
                </label>
              ) : null}

              <label className="block text-sm">
                <span className="mb-2 block text-muted-foreground">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="focus-luxury h-11 w-full rounded-xl border border-border/70 bg-background/30 px-3"
                  required
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block text-muted-foreground">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="focus-luxury h-11 w-full rounded-xl border border-border/70 bg-background/30 px-3"
                  required
                  minLength={8}
                />
              </label>

              {mode === "register" ? (
                <label className="block text-sm">
                  <span className="mb-2 block text-muted-foreground">Phone (optional)</span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="focus-luxury h-11 w-full rounded-xl border border-border/70 bg-background/30 px-3"
                  />
                </label>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="focus-luxury h-11 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {loading ? "Submitting..." : mode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>

            {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}
          </PremiumCard>
        </div>
      </SectionShell>
    </PageShell>
  );
}
