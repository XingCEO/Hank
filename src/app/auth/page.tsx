"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageShell } from "@/components/page-shell";
import { SectionShell } from "@/components/ultra/section";
import type { RoleKey } from "@/lib/auth/constants";
import { canAccessDashboardPath, getDefaultDashboardPath, normalizeNextPath } from "@/lib/auth/policy";

type Mode = "login" | "register";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    filter: "blur(4px)",
  }),
};

const fieldVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: { opacity: 1, height: "auto", marginTop: 16 },
};

const inputClass =
  "focus-ring h-10 w-full rounded-lg border border-border/50 bg-white px-3 text-sm transition-colors focus:border-foreground/30";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [direction, setDirection] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setDirection(next === "register" ? 1 : -1);
    setMode(next);
    setMessage("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { email, password, name, phone: phone || undefined };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
        user?: { name?: string; roles?: RoleKey[] };
      };

      if (!response.ok || !data.ok) {
        setMessage(data.message ?? "操作失敗");
        return;
      }

      const roles = data.user?.roles ?? [];
      const nextPath = normalizeNextPath(
        typeof window === "undefined" ? null : new URL(window.location.href).searchParams.get("next"),
      );
      const fallbackPath = getDefaultDashboardPath(roles);
      const redirectTo = nextPath && canAccessDashboardPath(roles, nextPath) ? nextPath : fallbackPath;

      setMessage(`成功，歡迎 ${data.user?.name ?? ""}。正在跳轉至 ${redirectTo}...`);
      router.push(redirectTo);
      router.refresh();
    } catch {
      setMessage("系統忙碌，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell path="/auth">
      <SectionShell className="pt-[var(--space-top-offset)]">
        <div className="container-ultra max-w-md">
          <motion.div
            layout
            transition={{ layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
            className="overflow-hidden rounded-xl border border-border/40 bg-white p-8 shadow-[var(--shadow-card)]"
          >
            {/* ── Pill toggle ── */}
            <div className="relative mx-auto flex w-fit rounded-lg border border-border/40 bg-secondary/40 p-1">
              {(["login", "register"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => switchMode(tab)}
                  className="focus-ring relative z-10 rounded-full px-6 py-2 text-sm font-medium transition-colors"
                  style={{
                    color:
                      mode === tab
                        ? "var(--primary-foreground)"
                        : "var(--muted-foreground)",
                  }}
                >
                  {tab === "login" ? "登入" : "註冊"}
                  {mode === tab && (
                    <motion.span
                      layoutId="auth-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ── Animated heading ── */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={mode + "-heading"}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 text-center"
              >
                <h1 className="text-2xl font-semibold">
                  {mode === "login" ? "歡迎回來" : "建立帳號"}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {mode === "login"
                    ? "登入以管理預約與查看專屬內容"
                    : "註冊後即可預約拍攝與下載素材"}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* ── Form ── */}
            <form onSubmit={onSubmit} className="mt-6">
              {/* Register-only: name field */}
              <AnimatePresence initial={false}>
                {mode === "register" && (
                  <motion.div
                    key="name-field"
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <label className="block text-sm">
                      <span className="mb-2 block text-muted-foreground">姓名</span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                        required
                        placeholder="您的姓名"
                      />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Shared: email */}
              <div className="mt-4">
                <label className="block text-sm">
                  <span className="mb-2 block text-muted-foreground">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    required
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              {/* Shared: password */}
              <div className="mt-4">
                <label className="block text-sm">
                  <span className="mb-2 block text-muted-foreground">密碼</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    required
                    minLength={8}
                    placeholder="至少 8 個字元"
                  />
                </label>
              </div>

              {/* Register-only: phone field */}
              <AnimatePresence initial={false}>
                {mode === "register" && (
                  <motion.div
                    key="phone-field"
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <label className="block text-sm">
                      <span className="mb-2 block text-muted-foreground">
                        電話（選填）
                      </span>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={inputClass}
                        placeholder="0912-345-678"
                      />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="focus-ring mt-6 h-10 w-full rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition-opacity disabled:opacity-50"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={loading ? "loading" : mode}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="block"
                  >
                    {loading
                      ? "處理中..."
                      : mode === "login"
                        ? "登入"
                        : "註冊並登入"}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </form>

            {/* ── Toggle hint ── */}
            <p className="mt-5 text-center text-xs text-muted-foreground">
              {mode === "login" ? "還沒有帳號？" : "已有帳號？"}
              <button
                type="button"
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                className="focus-ring ml-1 font-medium text-foreground hover:underline"
              >
                {mode === "login" ? "立即註冊" : "返回登入"}
              </button>
            </p>

            {/* ── Status message ── */}
            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 text-center text-sm text-muted-foreground"
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </SectionShell>
    </PageShell>
  );
}
