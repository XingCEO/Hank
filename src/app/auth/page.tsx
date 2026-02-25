"use client";

import { FormEvent, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { RoleKey } from "@/lib/auth/constants";
import { canAccessDashboardPath, getDefaultDashboardPath, normalizeNextPath } from "@/lib/auth/policy";
import { Eye, EyeOff, Check, X, Loader2, ArrowLeft } from "lucide-react";

/* --- 型別 --- */
type Mode = "login" | "register";

/* --- 密碼強度 --- */
type StrengthCheck = { label: string; pass: boolean };
function getPasswordChecks(pw: string): StrengthCheck[] {
  return [
    { label: "至少 12 個字元", pass: pw.length >= 12 },
    { label: "包含大寫字母", pass: /[A-Z]/.test(pw) },
    { label: "包含小寫字母", pass: /[a-z]/.test(pw) },
    { label: "包含數字", pass: /\d/.test(pw) },
    { label: "包含特殊符號", pass: /[!@#$%^&*()_\-+=[\]{};'':"\\|,.<>/?`~]/.test(pw) },
  ];
}
function getStrengthScore(checks: StrengthCheck[]) {
  return checks.filter((c) => c.pass).length;
}
const strengthLabel = ["", "弱", "普通", "中等", "良好", "強"] as const;
const strengthColors = ["", "bg-red-400", "bg-orange-400", "bg-amber-400", "bg-lime-400", "bg-emerald-400"] as const;

/* --- Floating label input --- */
interface FloatInputProps {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; required?: boolean; autoComplete?: string;
  error?: string; rightSlot?: React.ReactNode; minLength?: number;
}

function FloatInput({ id, label, type = "text", value, onChange, required, autoComplete, error, rightSlot, minLength }: FloatInputProps) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  return (
    <div className="relative">
      <div className={["relative overflow-hidden rounded-lg border transition-all duration-200",
        error ? "border-red-300 bg-red-50/60"
          : focused ? "border-foreground/30 bg-white shadow-[0_0_0_3px_oklch(0.42_0.04_60/0.07)]"
            : "border-border/70 bg-white/80 hover:border-border"].join(" ")}>
        <label htmlFor={id} className={["pointer-events-none absolute left-3.5 transition-all duration-200 select-none",
          lifted ? "top-1.5 text-[10px] tracking-[0.06em] text-muted-foreground/80"
            : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"].join(" ")}>
          {label}
        </label>
        <input id={id} type={type} value={value} required={required} autoComplete={autoComplete} minLength={minLength}
          onChange={(e) => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className={["h-[3.25rem] w-full bg-transparent px-3.5 pb-1 pt-[1.3rem] text-sm text-foreground outline-none", rightSlot ? "pr-11" : ""].join(" ")} />
        {rightSlot && <div className="absolute right-2.5 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }} className="mt-1 flex items-center gap-1 text-[11px] text-red-500">
            <X className="h-3 w-3 shrink-0" />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- 成功覆蓋 --- */
function SuccessOverlay({ name }: { name: string }) {
  return (
    <motion.div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-white"
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}>
      <motion.div className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground/8"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 22, delay: 0.1 }}>
        <Check className="h-7 w-7 text-foreground" />
      </motion.div>
      <motion.div className="absolute h-14 w-14 rounded-full border border-foreground/20"
        initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 2.6, opacity: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }} />
      <motion.p className="mt-5 text-base font-medium text-foreground"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        歡迎，{name}
      </motion.p>
      <motion.p className="mt-1 text-xs text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        正在跳轉至您的主控台
      </motion.p>
      <motion.div className="mt-5 h-px w-28 overflow-hidden bg-border">
        <motion.div className="h-full bg-foreground" initial={{ width: 0 }} animate={{ width: "100%" }}
          transition={{ duration: 1.3, delay: 0.7, ease: "easeInOut" }} />
      </motion.div>
    </motion.div>
  );
}

/* ======== 登入左側面板  深色品牌空間 ======== */
function LoginPanel() {
  const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
  const projects = [
    { cat: "婚禮紀實", name: "林  江 | 木質莊園婚禮", year: "2026" },
    { cat: "品牌形象", name: "VIVE 美妝品牌全年視覺", year: "2025" },
    { cat: "活動紀錄", name: "TechSummit Asia 媒體影像", year: "2025" },
  ];
  return (
    <div className="flex h-full flex-col justify-between p-10 xl:p-14">
      <div>
        <p className="text-[0.62rem] font-semibold tracking-[0.28em] text-white/40 uppercase">Studio Pro</p>
        <div className="mt-3 h-px w-full bg-white/10" />
      </div>
      <div>
        <p className="text-[0.6rem] tracking-[0.22em] text-white/30 uppercase">會員入口</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">
          您留下的作品，<br /><span className="text-white/40">在這裡等您。</span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/40">
          登入後即可查看專案進度、下載素材並管理您的預約紀錄。
        </p>
        <div className="mt-8 space-y-2">
          {projects.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease }}
              className="flex items-center justify-between rounded-lg border border-white/8 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <div>
                <p className="text-[0.6rem] tracking-[0.16em] text-white/35 uppercase">{p.cat}</p>
                <p className="mt-0.5 text-[0.8rem] font-medium text-white/75">{p.name}</p>
              </div>
              <span className="text-[0.7rem] text-white/25">{p.year}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <div>
        <div className="h-px w-full bg-white/10" />
        <div className="mt-4 flex gap-6">
          {[["520+", "完成專案"], ["4.9", "平均評分"], ["<4h", "平均回覆"]].map(([v, l]) => (
            <div key={l}>
              <p className="text-sm font-semibold text-white/70">{v}</p>
              <p className="mt-0.5 text-[0.6rem] tracking-[0.1em] text-white/25 uppercase">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ======== 註冊左側面板  淺色邀請入口 ======== */
function RegisterPanel() {
  const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
  const features = [
    { num: "01", title: "線上預約管理", body: "直接在客戶入口預約拍攝時段，即時查看可用檔期，無需來回信件確認。" },
    { num: "02", title: "專案進度追蹤", body: "每個里程碑即時更新，從拍攝前準備到最終交付，全流程透明可見。" },
    { num: "03", title: "高清素材下載", body: "精修完成的影像直接在平台下載，支援多種格式輸出，無需等待傳輸連結。" },
  ];
  return (
    <div className="flex h-full flex-col justify-between p-10 xl:p-14">
      <div>
        <p className="text-[0.62rem] font-semibold tracking-[0.28em] text-foreground/35 uppercase">Studio Pro</p>
        <div className="mt-3 h-px w-full bg-foreground/10" />
      </div>
      <div>
        <p className="text-[0.6rem] tracking-[0.22em] text-foreground/35 uppercase">客戶入口</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-foreground xl:text-[2.1rem]">
          加入工作室客群，<br /><span className="text-foreground/40">開啟您的影像之旅。</span>
        </h2>
        <div className="mt-8 space-y-3">
          {features.map((f, i) => (
            <motion.div key={f.num} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease }}
              className="rounded-lg border border-border/50 bg-white/80 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-[0.7rem] font-semibold text-foreground/25">{f.num}</span>
                <div>
                  <p className="text-[0.82rem] font-semibold text-foreground">{f.title}</p>
                  <p className="mt-1 text-[0.75rem] leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div>
        <div className="h-px w-full bg-foreground/8" />
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          「從確認訂金到素材交付，整套流程在平台上一氣呵成，完全不需要追 Email。」
        </p>
        <p className="mt-2 text-[0.65rem] tracking-[0.1em] text-foreground/30 uppercase"> 林小姐，商業品牌客戶</p>
      </div>
    </div>
  );
}

/* ======== 主頁面 ======== */
export default function AuthPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); const [showPw, setShowPw] = useState(false);
  const [phone, setPhone] = useState("");
  const [nameErr, setNameErr] = useState(""); const [emailErr, setEmailErr] = useState(""); const [passwordErr, setPasswordErr] = useState("");
  const [loading, setLoading] = useState(false); const [globalError, setGlobalError] = useState(""); const [successName, setSuccessName] = useState("");
  const checks = getPasswordChecks(password);
  const score = getStrengthScore(checks);
  const showStrength = mode === "register" && password.length > 0;
  const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
  const formRef = useRef<HTMLFormElement>(null);

  const switchMode = useCallback((next: Mode) => {
    if (next === mode) return;
    setMode(next); setGlobalError("");
    setNameErr(""); setEmailErr(""); setPasswordErr("");
    setPassword(""); setShowPw(false);
  }, [mode]);

  function validateForm(): boolean {
    let valid = true;
    setNameErr(""); setEmailErr(""); setPasswordErr("");
    if (mode === "register" && name.trim().length < 2) { setNameErr("姓名至少需要 2 個字元"); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr("請輸入有效的電子郵件地址"); valid = false; }
    if (mode === "register" && score < 5) {
      const failed = checks.find((c) => !c.pass);
      setPasswordErr(failed?.label ? `密碼需：${failed.label}` : "密碼不符合要求"); valid = false;
    }
    if (mode === "login" && password.length === 0) { setPasswordErr("請輸入密碼"); valid = false; }
    return valid;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true); setGlobalError("");
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = mode === "login" ? { email, password } : { email, password, name: name.trim(), phone: phone || undefined };
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await res.json()) as { ok?: boolean; message?: string; user?: { name?: string; roles?: RoleKey[] }; lockedUntil?: number };
      if (!res.ok || !data.ok) {
        if (res.status === 423 && data.lockedUntil) {
          const remaining = Math.ceil((data.lockedUntil - Date.now()) / 60000);
          setGlobalError(`帳號已暫時鎖定，請 ${remaining} 分鐘後再試`);
        } else { setGlobalError(data.message ?? "操作失敗，請稍後再試"); }
        return;
      }
      const roles = data.user?.roles ?? [];
      const nextPath = normalizeNextPath(typeof window === "undefined" ? null : new URL(window.location.href).searchParams.get("next"));
      const fallback = getDefaultDashboardPath(roles);
      const redirectTo = nextPath && canAccessDashboardPath(roles, nextPath) ? nextPath : fallback;
      setSuccessName(data.user?.name ?? "");
      setTimeout(() => { router.push(redirectTo); router.refresh(); }, 1600);
    } catch { setGlobalError("系統忙碌，請稍後再試"); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-dvh overflow-hidden bg-background">
      {/* 左側品牌面板 */}
      <div className="relative hidden overflow-hidden lg:block lg:w-[52%] xl:w-[54%]">
        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <motion.div key="lp" className="absolute inset-0 bg-foreground"
              initial={shouldReduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease }}>
              <LoginPanel />
            </motion.div>
          ) : (
            <motion.div key="rp" className="absolute inset-0 border-r border-border/40 bg-[oklch(0.97_0.004_80)]"
              initial={shouldReduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease }}>
              <RegisterPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 右側表單面板 */}
      <div className="flex w-full flex-col lg:w-[48%] xl:w-[46%]">
        {/* 頂部列 */}
        <div className="flex items-center justify-between border-b border-border/40 px-8 py-4">
          <Link href="/" className="focus-ring inline-flex items-center gap-1.5 text-[0.75rem] text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-3 w-3" />返回主站
          </Link>
          <p className="text-[0.65rem] font-semibold tracking-[0.22em] text-foreground/50 uppercase lg:hidden">Studio Pro</p>
          <div className="w-12 lg:hidden" />
        </div>

        {/* 主體 */}
        <div className="flex flex-1 items-start justify-center overflow-y-auto px-8 py-10 sm:px-12">
          <div className="relative w-full max-w-[380px]">
            <AnimatePresence>
              {successName && <SuccessOverlay name={successName} />}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.div key="lf" initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.38, ease }}>
                  <div className="mb-8">
                    <p className="text-[0.6rem] tracking-[0.22em] text-foreground/35 uppercase">帳號登入</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">歡迎回來</h1>
                    <p className="mt-1.5 text-sm text-muted-foreground">登入後查看您的專案與素材。</p>
                  </div>
                  <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-4">
                    <FloatInput id="l-email" label="電子郵件" type="email" value={email}
                      onChange={setEmail} required autoComplete="email" error={emailErr} />
                    <FloatInput id="l-password" label="密碼" type={showPw ? "text" : "password"}
                      value={password} onChange={setPassword} required autoComplete="current-password" error={passwordErr}
                      rightSlot={
                        <button type="button" onClick={() => setShowPw((v) => !v)}
                          className="focus-ring rounded p-1 text-muted-foreground transition-colors hover:text-foreground" tabIndex={-1}>
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      } />
                    <AnimatePresence>
                      {globalError && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/70 px-3.5 py-2.5 text-xs text-red-700">
                          <X className="h-3.5 w-3.5 shrink-0 text-red-500" />{globalError}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.button type="submit" disabled={loading || !!successName}
                      className="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-semibold text-background transition-opacity disabled:opacity-60"
                      whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: 0.99 }}>
                      <AnimatePresence mode="wait">
                        {loading ? (
                          <motion.span key="ld" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />處理中
                          </motion.span>
                        ) : (
                          <motion.span key="lb" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>登入</motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </form>
                  <div className="mt-8 border-t border-border/30 pt-6">
                    <p className="text-[0.78rem] text-muted-foreground">還沒有帳號？</p>
                    <button type="button" onClick={() => switchMode("register")}
                      className="focus-ring mt-2 flex w-full items-center justify-between rounded-lg border border-border/60 bg-white px-4 py-3 text-left transition-colors hover:border-foreground/30 hover:bg-secondary/60">
                      <div>
                        <p className="text-sm font-medium text-foreground">建立客戶帳號</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">預約拍攝  追蹤專案  下載素材</p>
                      </div>
                      <span className="text-muted-foreground"></span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="rf" initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.38, ease }}>
                  <div className="mb-8">
                    <p className="text-[0.6rem] tracking-[0.22em] text-foreground/35 uppercase">建立帳號</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">開始您的影像之旅</h1>
                    <p className="mt-1.5 text-sm text-muted-foreground">完成後即可預約拍攝、追蹤進度與下載素材。</p>
                  </div>
                  <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-4">
                    <FloatInput id="r-name" label="姓名" value={name} onChange={setName} required autoComplete="name" error={nameErr} />
                    <FloatInput id="r-email" label="電子郵件" type="email" value={email} onChange={setEmail} required autoComplete="email" error={emailErr} />
                    <div>
                      <FloatInput id="r-password" label="密碼" type={showPw ? "text" : "password"}
                        value={password} onChange={setPassword} required minLength={12}
                        autoComplete="new-password" error={passwordErr}
                        rightSlot={
                          <button type="button" onClick={() => setShowPw((v) => !v)}
                            className="focus-ring rounded p-1 text-muted-foreground transition-colors hover:text-foreground" tabIndex={-1}>
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        } />
                      <AnimatePresence>
                        {showStrength && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }} className="overflow-hidden">
                            <div className="mt-2 flex gap-1">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <div key={n} className={["h-0.5 flex-1 rounded-full transition-colors duration-300",
                                  score >= n ? strengthColors[score] : "bg-border"].join(" ")} />
                              ))}
                            </div>
                            <div className="mt-1.5">
                              <span className="text-[11px] text-muted-foreground">
                                強度：<span className={score >= 4 ? "text-emerald-600" : score >= 3 ? "text-amber-500" : "text-red-500"}>
                                  {strengthLabel[score]}
                                </span>
                              </span>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                              {checks.map(({ label, pass }) => (
                                <div key={label} className="flex items-center gap-1" style={{ opacity: pass ? 1 : 0.45 }}>
                                  {pass ? <Check className="h-3 w-3 text-emerald-500" /> : <X className="h-3 w-3 text-border" />}
                                  <span className="text-[10px] text-muted-foreground">{label}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <FloatInput id="r-phone" label="電話（選填）" type="tel" value={phone} onChange={setPhone} autoComplete="tel" />
                    <AnimatePresence>
                      {globalError && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/70 px-3.5 py-2.5 text-xs text-red-700">
                          <X className="h-3.5 w-3.5 shrink-0 text-red-500" />{globalError}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.button type="submit" disabled={loading || !!successName}
                      className="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-semibold text-background transition-opacity disabled:opacity-60"
                      whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: 0.99 }}>
                      <AnimatePresence mode="wait">
                        {loading ? (
                          <motion.span key="rld" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />處理中
                          </motion.span>
                        ) : (
                          <motion.span key="rlb" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                            建立帳號並登入
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    <p className="text-center text-[11px] text-muted-foreground">
                      建立帳號即代表您同意
                      <Link href="/privacy" className="mx-1 underline underline-offset-2">隱私政策</Link>
                      與
                      <Link href="/terms" className="mx-1 underline underline-offset-2">服務條款</Link>
                    </p>
                  </form>
                  <div className="mt-8 border-t border-border/30 pt-6">
                    <p className="text-[0.78rem] text-muted-foreground">已有帳號？</p>
                    <button type="button" onClick={() => switchMode("login")}
                      className="focus-ring mt-2 flex w-full items-center justify-between rounded-lg border border-border/60 bg-white px-4 py-3 text-left transition-colors hover:border-foreground/30 hover:bg-secondary/60">
                      <div>
                        <p className="text-sm font-medium text-foreground">返回登入</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">使用現有帳號密碼登入</p>
                      </div>
                      <span className="text-muted-foreground"></span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
