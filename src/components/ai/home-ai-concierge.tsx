"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  links?: Array<{ label: string; href: string }>;
};

type ConciergeResponse = {
  ok: boolean;
  reply?: string;
  links?: Array<{ label: string; href: string }>;
  message?: string;
};

const QUICK_ASKS = ["價格怎麼算？", "如何預約拍攝？", "我要登入會員", "如何進入管理後台？"];

export function HomeAiConcierge() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "嗨，我是品牌旗艦 AI 客服。你可以直接問我價格、預約、登入或後台相關問題。",
    },
  ]);

  const seq = useRef(1);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `u-${seq.current++}`,
      role: "user",
      content: trimmed,
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/ai/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const payload = (await response.json()) as ConciergeResponse;
      if (!response.ok || payload.ok === false || !payload.reply) {
        throw new Error(payload.message ?? "AI 客服暫時無法回應。");
      }

      const assistantMessage: ChatMessage = {
        id: `a-${seq.current++}`,
        role: "assistant",
        content: payload.reply,
        links: payload.links ?? [],
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: `e-${seq.current++}`,
        role: "assistant",
        content: error instanceof Error ? error.message : "AI 客服暫時無法回應。",
      };
      setMessages((current) => [...current, assistantMessage]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-5 bottom-5 z-50 h-11 rounded-full px-4 shadow-[var(--shadow-accent)]"
      >
        {open ? <X className="size-4" /> : <MessageCircle className="size-4" />}
        AI 客服
      </Button>

      <aside
        className={cn(
          "fixed right-5 bottom-20 z-50 w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)] transition-all",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-border/70 bg-background/70 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-border/70 bg-background/70 p-1.5">
              <Bot className="size-4 text-primary" />
            </span>
            <div>
              <p className="text-sm font-medium">AI 客服（Beta）</p>
              <p className="text-xs text-muted-foreground">先回答常見問題，快速導流到正確頁面</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary"
            onClick={() => setOpen(false)}
            aria-label="關閉 AI 客服"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="max-h-[52vh] space-y-2 overflow-y-auto px-3 py-3">
          {messages.map((msg) => (
            <article
              key={msg.id}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm",
                msg.role === "assistant"
                  ? "border-border/70 bg-background/70"
                  : "ml-8 border-primary/30 bg-primary/10",
              )}
            >
              <p>{msg.content}</p>
              {msg.links && msg.links.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.links.map((link) => (
                    <Link
                      key={`${msg.id}-${link.href}`}
                      href={link.href}
                      className="rounded-full border border-border/70 px-2.5 py-1 text-xs hover:border-primary/60"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>

        <div className="border-t border-border/70 px-3 py-3">
          <div className="mb-2 flex flex-wrap gap-2">
            {QUICK_ASKS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void ask(q)}
                className="rounded-full border border-border/70 px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/60 hover:text-foreground"
                disabled={sending}
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void ask(input);
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="輸入你的問題..."
              disabled={sending}
              maxLength={300}
            />
            <Button type="submit" size="icon" disabled={!canSend}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
