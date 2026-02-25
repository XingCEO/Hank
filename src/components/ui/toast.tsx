"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

/* ─── 型別 ─── */
export type ToastVariant = "default" | "success" | "error" | "info";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

/* ─── Context ─── */
type ToastContextValue = {
  toasts: Toast[];
  toast: (opts: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

/* ─── 圖示 ─── */
const icons: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="h-4 w-4 text-muted-foreground" />,
  success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
};

const variantClasses: Record<ToastVariant, string> = {
  default: "border-border/60 bg-white",
  success: "border-emerald-200 bg-emerald-50/80",
  error: "border-red-200 bg-red-50/80",
  info: "border-blue-200 bg-blue-50/80",
};

/* ─── Toaster Provider ─── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...opts, id }]);
    return id;
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

/* ─── Hook ─── */
export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
  return ctx;
}

/* ─── Toaster ─── */
function Toaster() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) return null;
  const { toasts, dismiss } = ctx;

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            duration={t.duration ?? 4500}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id);
            }}
            asChild
          >
            <motion.li
              layout
              initial={{ opacity: 0, x: 64, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 64, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={[
                "pointer-events-auto flex w-[340px] items-start gap-3 rounded-xl border p-4 shadow-[var(--shadow-elevated)] backdrop-blur-sm",
                variantClasses[t.variant ?? "default"],
              ].join(" ")}
            >
              <div className="mt-0.5 shrink-0">
                {icons[t.variant ?? "default"]}
              </div>
              <div className="flex-1 min-w-0">
                {t.title && (
                  <ToastPrimitive.Title className="text-sm font-semibold text-foreground leading-snug">
                    {t.title}
                  </ToastPrimitive.Title>
                )}
                {t.description && (
                  <ToastPrimitive.Description className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    {t.description}
                  </ToastPrimitive.Description>
                )}
              </div>
              <ToastPrimitive.Close className="focus-ring shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </ToastPrimitive.Close>
            </motion.li>
          </ToastPrimitive.Root>
        ))}
      </AnimatePresence>

      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 outline-none" />
    </ToastPrimitive.Provider>
  );
}
