"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
const DUPLICATE_SEND_WINDOW_MS = 1200;
const TYPE_INTERVAL_MS = 20;
const AUTO_STICK_THRESHOLD_PX = 32;

function cleanAssistantReply(raw: string): string {
  const noControl = raw
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\uFFFD/g, "");

  const noMarkdown = noControl
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1");

  const blocks = noMarkdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const uniqueBlocks: string[] = [];
  const seen = new Set<string>();
  for (const block of blocks) {
    const key = block.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    uniqueBlocks.push(block);
  }

  const normalized = (uniqueBlocks.length > 0 ? uniqueBlocks.join("\n\n") : noMarkdown)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return normalized || "AI 客服暫時無法回應。";
}

function dedupeLinks(links: Array<{ label: string; href: string }> | undefined): Array<{ label: string; href: string }> {
  if (!links || links.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const unique: Array<{ label: string; href: string }> = [];
  for (const item of links) {
    const key = `${item.label}|${item.href}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(item);
  }

  return unique;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function HomeAiConcierge() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "✨ 嗨，我是品牌旗艦 AI 客服。你可以直接問我價格、預約、登入或後台相關問題。",
    },
  ]);

  const seq = useRef(1);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inFlightRef = useRef(false);
  const lastSubmittedRef = useRef<{ text: string; at: number } | null>(null);
  const typingAbortRef = useRef<AbortController | null>(null);
  const shouldStickToBottomRef = useRef(true);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  useEffect(() => {
    return () => {
      typingAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (open) {
      shouldStickToBottomRef.current = true;
      scrollChatToBottom("auto", true);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    scrollChatToBottom("auto");
  }, [messages, open]);

  function isNearBottom(el: HTMLDivElement): boolean {
    return el.scrollHeight - el.scrollTop - el.clientHeight <= AUTO_STICK_THRESHOLD_PX;
  }

  function scrollChatToBottom(behavior: ScrollBehavior, force = false) {
    const el = listRef.current;
    if (!el) {
      return;
    }
    if (!force && !shouldStickToBottomRef.current) {
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior });
  }

  function handleChatScroll() {
    const el = listRef.current;
    if (!el) {
      return;
    }
    shouldStickToBottomRef.current = isNearBottom(el);
  }

  async function appendAssistantMessageWithTyping(rawReply: string, links?: Array<{ label: string; href: string }>) {
    const content = cleanAssistantReply(rawReply);
    const uniqueLinks = dedupeLinks(links);
    const messageId = `a-${seq.current++}`;

    const controller = new AbortController();
    typingAbortRef.current?.abort();
    typingAbortRef.current = controller;

    setMessages((current) => [...current, { id: messageId, role: "assistant", content: "", links: [] }]);

    const chars = Array.from(content);
    const step = chars.length > 900 ? 12 : chars.length > 500 ? 8 : chars.length > 220 ? 5 : 3;

    for (let i = step; i <= chars.length; i += step) {
      if (controller.signal.aborted) {
        return;
      }

      const chunk = chars.slice(0, Math.min(i, chars.length)).join("");
      setMessages((current) =>
        current.map((message) => (message.id === messageId ? { ...message, content: chunk } : message)),
      );
      await sleep(TYPE_INTERVAL_MS);
    }

    if (controller.signal.aborted) {
      return;
    }

    setMessages((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, content, links: uniqueLinks } : message,
      ),
    );

    if (typingAbortRef.current === controller) {
      typingAbortRef.current = null;
    }
  }

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending || inFlightRef.current) {
      return;
    }

    const lastSubmitted = lastSubmittedRef.current;
    const now = Date.now();
    if (lastSubmitted && lastSubmitted.text === trimmed && now - lastSubmitted.at < DUPLICATE_SEND_WINDOW_MS) {
      return;
    }
    lastSubmittedRef.current = { text: trimmed, at: now };
    inFlightRef.current = true;
    shouldStickToBottomRef.current = true;

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

      await appendAssistantMessageWithTyping(payload.reply, payload.links ?? []);
    } catch (error) {
      await appendAssistantMessageWithTyping(
        error instanceof Error ? error.message : "AI 客服暫時無法回應。",
      );
    } finally {
      inFlightRef.current = false;
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

        <div
          ref={listRef}
          onScroll={handleChatScroll}
          className="max-h-[52vh] space-y-2 overflow-y-auto overscroll-contain px-3 py-3"
        >
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
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
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
