"use client";

import { FormEvent, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { PremiumCard, SectionShell } from "@/components/ultra/section";

type Mode = "login" | "register";

export default function AuthPage() {
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

      const data = (await response.json()) as { ok?: boolean; message?: string; user?: { name?: string } };

      if (!response.ok || !data.ok) {
        setMessage(data.message ?? "操作失敗");
        return;
      }

      setMessage(`成功，歡迎 ${data.user?.name ?? ""}。你可前往 /portal、/photographer、/admin 測試權限。`);
    } catch {
      setMessage("系統忙碌，請稍後再試。");
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
                登入
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`focus-luxury rounded-full border px-4 py-2 text-sm ${mode === "register" ? "border-primary bg-primary text-primary-foreground" : "border-border/70 text-muted-foreground"}`}
              >
                註冊
              </button>
            </div>

            <h1 className="mt-4 text-3xl">{mode === "login" ? "會員登入" : "建立會員帳號"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              第一版以 Email + 密碼為主。管理員可在後台更新角色，切換客戶/攝影師/管理員權限。
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {mode === "register" ? (
                <label className="block text-sm">
                  <span className="mb-2 block text-muted-foreground">姓名</span>
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
                <span className="mb-2 block text-muted-foreground">密碼</span>
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
                  <span className="mb-2 block text-muted-foreground">電話（選填）</span>
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
                {loading ? "處理中..." : mode === "login" ? "登入" : "註冊並登入"}
              </button>
            </form>

            {message ? <p className="mt-4 text-sm text-muted-foreground">{message}</p> : null}
          </PremiumCard>
        </div>
      </SectionShell>
    </PageShell>
  );
}
