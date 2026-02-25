"use client";

import { FormEvent, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { RoleKey } from "@/lib/auth/constants";
import { canAccessDashboardPath, getDefaultDashboardPath, normalizeNextPath } from "@/lib/auth/policy";
import { Eye, EyeOff, Check, X, Loader2, ArrowRight, Camera } from "lucide-react";

/* ─── 型別 ─── */
type Mode = "login" | "register";

/* ─── 密碼強度 ─── */
type StrengthCheck = { label: string; pass: boolean };
function getPasswordChecks(pw: string): StrengthCheck[] {
  return [
    { label: "至少 12 個字元", pass: pw.length >= 12 },
    { label: "包含大寫字母", pass: /[A-Z]/.test(pw) },
    { label: "包含小寫字母", pass: /[a-z]/.test(pw) },
    { label: "包含數字", pass: /\d/.test(pw) },
    { label: "包含特殊符號", pass: /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]/.test(pw) },
  ];
}
function getStrengthScore(checks: StrengthCheck[]) {
  return checks.filter((c) => c.pass).length;
}
const strengthLabel = ["", "弱", "普通", "中等", "良好", "強"] as const;
const strengthColors = [
  "",
  "bg-red-400",
  "bg-orange-400",
  "bg-amber-400",
  "bg-lime-400",
  "bg-emerald-400",
] as const;

/* ─── 動畫 variants ─── */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const panelVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const formVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 48 : -48,
    opacity: 0,
    filter: "blur(6px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -48 : 48,
    opacity: 0,
    filter: "blur(6px)",
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const fieldVariants = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    marginBottom: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const staggerContainer = {
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

/* ─── Floating label input ─── */
interface FloatInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
  error?: string;
  rightSlot?: React.ReactNode;
  minLength?: number;
}

function FloatInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
  autoComplete,
  error,
  rightSlot,
  minLength,
}: FloatInputProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className={[
          "relative overflow-hidden rounded-xl border transition-all duration-200",
          error
            ? "border-red-400 bg-red-50/40"
            : focused
              ? "border-foreground/40 bg-white shadow-[0_0_0_3px_oklch(0.42_0.04_60/0.08)]"
              : "border-border/60 bg-white/70",
        ].join(" ")}
      >
        <label
          htmlFor={id}
          className={[
            "pointer-events-none absolute left-3.5 transition-all duration-200 select-none",
            lifted
              ? "top-1.5 text-[10px] font-medium tracking-wide text-muted-foreground"
              : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
          ].join(" ")}
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={[
            "h-14 w-full bg-transparent px-3.5 pb-1.5 pt-5 text-sm text-foreground outline-none transition-colors",
            rightSlot ? "pr-11" : "",
          ].join(" ")}
        />
        {rightSlot && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 flex items-center gap-1 text-xs text-red-500"
          >
            <X className="h-3 w-3 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── 裝飾性 blob ─── */
function Blob({
  className,
  delay = 0,
  duration = 12,
}: {
  className?: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={["absolute rounded-full blur-3xl opacity-40 pointer-events-none", className].join(" ")}
      animate={{
        scale: [1, 1.15, 0.95, 1.1, 1],
        x: ["0%", "3%", "-2%", "1.5%", "0%"],
        y: ["0%", "-3%", "2%", "-1.5%", "0%"],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "mirror",
      }}
    />
  );
}

/* ─── 浮動裝飾卡 ─── */
function FloatingCard({
  className,
  delay = 0,
  children,
}: {
  className?: string;
  delay?: number;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      className={[
        "absolute rounded-xl border border-white/20 bg-white/10 backdrop-blur-md pointer-events-none",
        className,
      ].join(" ")}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, delay, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─── 成功動畫覆蓋層 ─── */
function SuccessOverlay({ name }: { name: string }) {
  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-white"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* 圓圈打勾 */}
      <motion.div
        className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
      >
        <Check className="h-8 w-8 text-emerald-500 stroke-[2.5]" />
      </motion.div>

      {/* 漣漪效果 */}
      <motion.div
        className="absolute h-16 w-16 rounded-full border-2 border-emerald-300"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 2.4, opacity: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
      />
      <motion.div
        className="absolute h-16 w-16 rounded-full border-2 border-emerald-200"
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{ scale: 3.2, opacity: 0 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
      />

      <motion.p
        className="mt-5 text-lg font-semibold text-foreground"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        歡迎，{name}
      </motion.p>
      <motion.p
        className="mt-1.5 text-sm text-muted-foreground"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        正在跳轉至您的主控台…
      </motion.p>

      {/* 進度條 */}
      <motion.div className="mt-6 h-0.5 w-32 overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full bg-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.4, delay: 0.7, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   主頁面
═══════════════════════════════════════════════ */
export default function AuthPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [mode, setMode] = useState<Mode>("login");
  const [direction, setDirection] = useState(0);

  /* 欄位值 */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [phone, setPhone] = useState("");

  /* 欄位錯誤 */
  const [nameErr, setNameErr] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  /* UI 狀態 */
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [successName, setSuccessName] = useState("");

  /* 密碼強度 */
  const checks = getPasswordChecks(password);
  const score = getStrengthScore(checks);
  const showStrength = mode === "register" && password.length > 0;

  /* ── 切換模式 ── */
  const switchMode = useCallback((next: Mode) => {
    if (next === mode) return;
    setDirection(next === "register" ? 1 : -1);
    setMode(next);
    setGlobalError("");
    setNameErr("");
    setEmailErr("");
    setPasswordErr("");
    setPassword("");
    setShowPw(false);
  }, [mode]);

  /* ── 前端驗證 ── */
  function validateForm(): boolean {
    let valid = true;
    setNameErr("");
    setEmailErr("");
    setPasswordErr("");

    if (mode === "register") {
      if (name.trim().length < 2) {
        setNameErr("姓名至少需要 2 個字元");
        valid = false;
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr("請輸入有效的電子郵件地址");
      valid = false;
    }
    if (mode === "register" && score < 5) {
      const failed = checks.find((c) => !c.pass);
      setPasswordErr(failed?.label ? `密碼需：${failed.label}` : "密碼不符合要求");
      valid = false;
    }
    if (mode === "login" && password.length === 0) {
      setPasswordErr("請輸入密碼");
      valid = false;
    }
    return valid;
  }

  /* ── 提交 ── */
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setGlobalError("");

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { email, password, name: name.trim(), phone: phone || undefined };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        user?: { name?: string; roles?: RoleKey[] };
        lockedUntil?: number;
      };

      if (!res.ok || !data.ok) {
        if (res.status === 423 && data.lockedUntil) {
          const remaining = Math.ceil((data.lockedUntil - Date.now()) / 60000);
          setGlobalError(`帳號已暫時鎖定，請 ${remaining} 分鐘後再試`);
        } else {
          setGlobalError(data.message ?? "操作失敗，請稍後再試");
        }
        return;
      }

      const roles = data.user?.roles ?? [];
      const nextPath = normalizeNextPath(
        typeof window === "undefined" ? null : new URL(window.location.href).searchParams.get("next"),
      );
      const fallback = getDefaultDashboardPath(roles);
      const redirectTo = nextPath && canAccessDashboardPath(roles, nextPath) ? nextPath : fallback;

      setSuccessName(data.user?.name ?? "");
      setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 1800);
    } catch {
      setGlobalError("系統忙碌，請稍後再試");
    } finally {
      setLoading(false);
    }
  }

  const formRef = useRef<HTMLFormElement>(null);

  /* ── 渲染 ── */
  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-background">

      {/* ══ 左側裝飾面板 ══ */}
      <motion.div
        className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-12 lg:flex lg:w-[55%]"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Blobs */}
        <Blob className="h-[480px] w-[480px] bg-amber-300/50 -top-24 -left-24" delay={0} duration={14} />
        <Blob className="h-[380px] w-[380px] bg-orange-400/30 bottom-32 right-0" delay={2} duration={11} />
        <Blob className="h-[300px] w-[300px] bg-yellow-200/40 top-1/2 left-1/3" delay={4} duration={16} />
        <Blob className="h-[200px] w-[200px] bg-amber-500/20 bottom-0 left-1/4" delay={1} duration={9} />

        {/* 浮動裝飾卡 */}
        {!shouldReduceMotion && (
          <>
            <FloatingCard className="right-12 top-32 w-44 px-4 py-3" delay={0.8}>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">專案已就緒</p>
                  <p className="text-[10px] text-white/60">婚禮紀錄 · 4 月</p>
                </div>
              </div>
            </FloatingCard>

            <FloatingCard className="bottom-40 right-8 w-36 p-3" delay={1.2}>
              <p className="text-xs font-semibold text-white">素材上線</p>
              <div className="mt-2 flex gap-1">
                {[40, 65, 50, 80, 55].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-4 rounded-sm bg-white/40"
                    style={{ height: h * 0.4 }}
                    initial={{ scaleY: 0, originY: 1 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 1.4 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                ))}
              </div>
            </FloatingCard>
          </>
        )}

        {/* Logo */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Hank Studio</span>
          </div>
        </motion.div>

        {/* 中央文案 */}
        <motion.div
          className="relative z-10 max-w-xs"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            記錄每個值得留下的瞬間
          </p>
          <h2 className="text-4xl font-bold leading-tight text-white">
            光影之間，<br />時間靜止。
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            專業婚禮與商業攝影，從預約到素材下載，全程線上管理。
          </p>
        </motion.div>

        {/* 底部統計 */}
        <motion.div
          className="relative z-10 flex gap-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          {[
            { num: "500+", label: "完成案件" },
            { num: "98%", label: "客戶滿意度" },
            { num: "8 年", label: "專業經驗" },
          ].map(({ num, label }) => (
            <div key={label}>
              <p className="text-xl font-bold text-white">{num}</p>
              <p className="mt-0.5 text-xs text-white/50">{label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ══ 右側表單面板 ══ */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[45%] lg:px-12">

        {/* 手機版 Logo */}
        <motion.div
          className="mb-8 flex items-center gap-2 lg:hidden"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <Camera className="h-4 w-4 text-background" />
          </div>
          <span className="text-base font-bold">Hank Studio</span>
        </motion.div>

        <motion.div
          className="relative w-full max-w-[400px]"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ── 成功覆蓋動畫 ── */}
          <AnimatePresence>
            {successName && <SuccessOverlay name={successName} />}
          </AnimatePresence>

          {/* ── 卡片容器 ── */}
          <motion.div
            layout
            transition={{ layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
            className="overflow-hidden rounded-2xl border border-border/40 bg-white/90 p-8 shadow-[var(--shadow-elevated)] backdrop-blur-sm"
          >
            {/* ── 模式切換 Tab ── */}
            <div className="flex rounded-xl border border-border/50 bg-secondary/50 p-1">
              {(["login", "register"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => switchMode(tab)}
                  className="focus-ring relative z-10 flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors"
                  style={{
                    color: mode === tab ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {tab === "login" ? "登入" : "建立帳號"}
                  {mode === tab && (
                    <motion.span
                      layoutId="auth-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-foreground"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ── 標題 ── */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={mode + "-heading"}
                custom={direction}
                variants={formVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="mt-6 mb-6"
              >
                <h1 className="text-xl font-semibold text-foreground">
                  {mode === "login" ? "歡迎回來" : "開始使用"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mode === "login"
                    ? "登入以管理預約、查看專案與下載素材"
                    : "建立帳號即可預約拍攝與存取您的素材"}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* ── 表單 ── */}
            <form ref={formRef} onSubmit={onSubmit} noValidate>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={mode + "-fields"}
                  custom={direction}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-4"
                >
                  {/* 姓名 (register only) */}
                  <AnimatePresence initial={false}>
                    {mode === "register" && (
                      <motion.div
                        key="name-field"
                        variants={fieldVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="overflow-hidden"
                      >
                        <motion.div variants={staggerItem}>
                          <FloatInput
                            id="auth-name"
                            label="姓名"
                            value={name}
                            onChange={setName}
                            required
                            autoComplete="name"
                            error={nameErr}
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email */}
                  <motion.div variants={staggerItem}>
                    <FloatInput
                      id="auth-email"
                      label="電子郵件"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      required
                      autoComplete="email"
                      error={emailErr}
                    />
                  </motion.div>

                  {/* 密碼 */}
                  <motion.div variants={staggerItem}>
                    <FloatInput
                      id="auth-password"
                      label="密碼"
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={setPassword}
                      required
                      minLength={mode === "register" ? 12 : 1}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      error={passwordErr}
                      rightSlot={
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          className="focus-ring rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                          tabIndex={-1}
                          aria-label={showPw ? "隱藏密碼" : "顯示密碼"}
                        >
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                    />

                    {/* 密碼強度 */}
                    <AnimatePresence>
                      {showStrength && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          {/* 強度條 */}
                          <div className="mt-2.5 flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <motion.div
                                key={n}
                                className={[
                                  "h-1 flex-1 rounded-full transition-colors duration-300",
                                  score >= n ? strengthColors[score] : "bg-border",
                                ].join(" ")}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: n * 0.04 }}
                                style={{ transformOrigin: "left" }}
                              />
                            ))}
                          </div>
                          <div className="mt-1.5 flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              強度：
                              <span
                                className={[
                                  "font-medium",
                                  score >= 4 ? "text-emerald-500" : score >= 3 ? "text-amber-500" : "text-red-500",
                                ].join(" ")}
                              >
                                {strengthLabel[score]}
                              </span>
                            </p>
                          </div>
                          {/* 細項勾核 */}
                          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                            {checks.map(({ label, pass }) => (
                              <motion.div
                                key={label}
                                className="flex items-center gap-1"
                                animate={{ opacity: pass ? 1 : 0.5 }}
                                transition={{ duration: 0.2 }}
                              >
                                {pass ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <X className="h-3 w-3 text-border" />
                                )}
                                <span className="text-[10px] text-muted-foreground">{label}</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* 電話 (register only) */}
                  <AnimatePresence initial={false}>
                    {mode === "register" && (
                      <motion.div
                        key="phone-field"
                        variants={fieldVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="overflow-hidden"
                      >
                        <motion.div variants={staggerItem}>
                          <FloatInput
                            id="auth-phone"
                            label="電話（選填）"
                            type="tel"
                            value={phone}
                            onChange={setPhone}
                            autoComplete="tel"
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>

              {/* 全域錯誤訊息 */}
              <AnimatePresence>
                {globalError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50/60 px-4 py-3 text-sm text-red-700"
                  >
                    <X className="h-4 w-4 shrink-0 text-red-500" />
                    {globalError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 送出按鈕 */}
              <motion.button
                type="submit"
                disabled={loading || !!successName}
                className="focus-ring group mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-opacity disabled:opacity-60"
                whileHover={{ scale: loading ? 1 : 1.012 }}
                whileTap={{ scale: loading ? 1 : 0.988 }}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      處理中…
                    </motion.span>
                  ) : (
                    <motion.span
                      key={mode}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2"
                    >
                      {mode === "login" ? "登入" : "建立帳號"}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>

            {/* 切換提示 */}
            <p className="mt-5 text-center text-xs text-muted-foreground">
              {mode === "login" ? "還沒有帳號？" : "已有帳號？"}
              <button
                type="button"
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                className="focus-ring ml-1 font-medium text-foreground underline-offset-2 hover:underline"
              >
                {mode === "login" ? "立即建立" : "返回登入"}
              </button>
            </p>
          </motion.div>

          {/* 隱私聲明 */}
          <motion.p
            className="mt-4 text-center text-[11px] text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            登入即代表您同意我們的
            <a href="/privacy" className="mx-1 underline-offset-2 hover:underline">隱私政策</a>
            與
            <a href="/terms" className="mx-1 underline-offset-2 hover:underline">服務條款</a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
