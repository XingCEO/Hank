import { z } from "zod";
import { NextResponse } from "next/server";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { getClientIpFromRequest, guardSameOrigin } from "@/lib/security/request-guard";

type SuggestionLink = {
  label: string;
  href: string;
};

type ConciergeAnswer = {
  reply: string;
  links?: SuggestionLink[];
};

type KnowledgeMatch = {
  score: number;
  answer: ConciergeAnswer;
};

type ClaudeApiStyle = "auto" | "anthropic" | "openai";

const askSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "請先輸入問題。")
    .max(1200, "問題太長，請精簡後再試。"),
});

const DEFAULT_CLAUDE_BASE_URL = "https://api.anthropic.com";
const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-5";

const DEFAULT_SYSTEM_PROMPT = `
你是 Studio Pro 網站的 AI 客服，同時具備程式技術顧問能力。

請嚴格遵守：
1. 回覆使用繁體中文，語氣專業、直接、可執行。
2. 若是網站/會員/後台問題，優先指引用戶正確頁面並給清楚步驟。
3. 若是程式開發問題，給可落地做法、必要時附短程式碼範例。
4. 不可捏造系統已執行的操作；不確定時要明確說明限制與下一步。
5. 不可輸出或要求機密資訊（API key、密碼、token、資料庫連線字串）。
6. 回覆盡量精簡，先給結論再補重點。

站內常用路徑：
- /auth：登入註冊
- /portal：一般會員入口
- /photographer：攝影師工作區
- /admin：管理後台
- /booking：預約
- /pricing：價格方案
- /services：服務說明
- /portfolio：作品集
- /process：合作流程
`.trim();

const GENERIC_LINKS: SuggestionLink[] = [
  { label: "預約諮詢", href: "/booking" },
  { label: "聯絡我們", href: "/contact" },
];

const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|rules|prompts?)/i,
  /(reveal|show|print|dump)\s+.*(system|developer|hidden)\s*(prompt|message|instruction)/i,
  /(jailbreak|dan mode|developer mode|god mode)/i,
  /(bypass|override)\s+(safety|guardrails?|policy|policies)/i,
  /(api[\s_-]?key|token|password|secret|database url|connection string)/i,
];

const KNOWLEDGE_BASE: Array<{
  keywords: string[];
  answer: ConciergeAnswer;
}> = [
  {
    keywords: ["價格", "費用", "報價", "多少錢", "方案"],
    answer: {
      reply:
        "如果你要先看方案區間，建議先到價格頁。若要精準報價，建議直接預約諮詢，我們會依拍攝類型、時程與交付需求報價。",
      links: [
        { label: "查看價格方案", href: "/pricing" },
        { label: "預約諮詢", href: "/booking" },
      ],
    },
  },
  {
    keywords: ["預約", "排程", "檔期", "時間", "booking"],
    answer: {
      reply:
        "你可以直接到預約頁挑服務與時段，送出後我們會盡快確認。若是企業專案，也可以先聯繫我們安排需求訪談。",
      links: [
        { label: "前往預約頁", href: "/booking" },
        { label: "聯絡我們", href: "/contact" },
      ],
    },
  },
  {
    keywords: ["服務", "拍攝", "能拍什麼", "提供什麼"],
    answer: {
      reply:
        "我們提供商業形象、品牌素材、企業活動與人像等拍攝服務，並可搭配後製與交付流程。你可以先看服務頁快速比對需求。",
      links: [{ label: "查看服務內容", href: "/services" }],
    },
  },
  {
    keywords: ["作品", "案例", "portfolio", "風格"],
    answer: {
      reply:
        "若你想確認風格與成果，建議先看作品集與案例頁。你也可以告訴我偏好的風格，我可以幫你先整理方向。",
      links: [
        { label: "瀏覽作品集", href: "/portfolio" },
        { label: "看案例", href: "/cases/grand-ballroom-wedding" },
      ],
    },
  },
  {
    keywords: ["登入", "註冊", "會員", "帳號", "portal"],
    answer: {
      reply:
        "會員可從登入頁進入。登入後會依你的角色導向對應入口（會員／攝影師／管理後台）。",
      links: [{ label: "前往登入註冊", href: "/auth" }],
    },
  },
  {
    keywords: ["管理", "admin", "權限", "後台"],
    answer: {
      reply:
        "管理後台提供會員權限、會員等級、密碼管理與稽核紀錄。需具備 admin 或 super_admin 角色才可存取。",
      links: [{ label: "進入管理後台", href: "/admin" }],
    },
  },
  {
    keywords: ["流程", "交件", "多久", "時程", "交付"],
    answer: {
      reply:
        "一般流程是需求確認、拍攝執行、後製修整、檔案交付。實際時程會依案件規模調整，急件可先說明需求。",
      links: [
        { label: "查看流程", href: "/process" },
        { label: "立即諮詢", href: "/contact" },
      ],
    },
  },
];

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    parsed.search = "";
    parsed.hash = "";

    const normalizedPath = parsed.pathname.replace(/\/+$/, "");
    parsed.pathname = normalizedPath.toLowerCase() === "/console" ? "" : normalizedPath;

    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return trimmed.replace(/\/+$/, "").replace(/\/console$/i, "");
  }
}

function parsePositiveInt(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

function parseApiStyle(value: string | undefined): ClaudeApiStyle {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "anthropic" || normalized === "openai") {
    return normalized;
  }
  return "auto";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function buildApiUrl(baseUrl: string, endpointPath: "/v1/messages" | "/v1/chat/completions"): string {
  const normalized = normalizeBaseUrl(baseUrl);
  if (normalized.endsWith("/v1")) {
    return `${normalized}${endpointPath.replace("/v1", "")}`;
  }
  return `${normalized}${endpointPath}`;
}

const claudeBaseUrl = normalizeBaseUrl(
  process.env.CLAUDE_API_BASE_URL?.trim() || DEFAULT_CLAUDE_BASE_URL,
);
const claudeApiKey = process.env.CLAUDE_API_KEY?.trim() ?? "";
const claudeModel = process.env.CLAUDE_MODEL?.trim() || DEFAULT_CLAUDE_MODEL;
const claudeTimeoutMs = parsePositiveInt(process.env.CLAUDE_TIMEOUT_MS, 15000, 4000, 60000);
const claudeApiStyle = parseApiStyle(process.env.CLAUDE_API_STYLE);
const conciergeSystemPrompt = process.env.AI_CONCIERGE_SYSTEM_PROMPT?.trim() || DEFAULT_SYSTEM_PROMPT;
const isClaudeConfigured = claudeApiKey.length > 0;
const forceAiLogs = process.env.AI_CONCIERGE_LOG === "1";

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function pickKnowledgeMatch(message: string): KnowledgeMatch {
  const normalized = message.toLowerCase();
  const tokens = new Set(tokenize(normalized));

  let bestScore = 0;
  let best: ConciergeAnswer | null = null;

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of item.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        score += 3;
      }

      const keywordTokens = tokenize(keyword);
      for (const t of keywordTokens) {
        if (tokens.has(t)) {
          score += 1;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      best = item.answer;
    }
  }

  if (best) {
    return { score: bestScore, answer: best };
  }

  return {
    score: 0,
    answer: {
      reply:
        "我先幫你快速整理：你可以告訴我『預算範圍、拍攝類型、預計日期』，我就能更精準建議下一步。",
      links: GENERIC_LINKS,
    },
  };
}

function summarizeMessageForFallback(message: string): string {
  const compact = message.replace(/\s+/g, " ").trim();
  if (!compact) {
    return "";
  }
  return compact.length > 32 ? `${compact.slice(0, 32)}...` : compact;
}

function buildGuidedFallback(message: string): ConciergeAnswer {
  const summary = summarizeMessageForFallback(message);
  const prefix = summary
    ? `我先幫你整理你剛剛提到的重點：「${summary}」。`
    : "我先幫你整理目前需求。";
  const modeHint =
    process.env.NODE_ENV !== "production" && !isClaudeConfigured
      ? "目前 AI 模型尚未設定（CLAUDE_API_KEY 為空），先以 FAQ 模式回覆。"
      : "我先用網站 FAQ 協助你快速釐清方向。";

  return {
    reply: `${prefix}${modeHint}你可以補充「預算範圍、拍攝類型、預計日期」，我就能更精準建議下一步。`,
    links: [
      { label: "查看價格方案", href: "/pricing" },
      { label: "立即預約諮詢", href: "/booking" },
      { label: "聯絡團隊", href: "/contact" },
    ],
  };
}

function stripMarkdownDecorators(text: string): string {
  return text
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}

function dedupeParagraphs(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return text.trim();
  }

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const block of paragraphs) {
    const key = block.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(block);
  }

  return unique.join("\n\n");
}

function normalizeReply(reply: string): string {
  const cleaned = reply
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\uFFFD/g, "");
  const noMarkdown = stripMarkdownDecorators(cleaned);
  const deduped = dedupeParagraphs(noMarkdown);
  return deduped.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, 1800);
}

function getRateLimitFingerprint(req: Request, ip: string): string {
  const userAgent = (req.headers.get("user-agent") ?? "unknown")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return `${ip}:${userAgent}`;
}

function looksLikePromptInjection(message: string): boolean {
  const normalized = message.trim();
  if (!normalized) {
    return false;
  }

  let hitCount = 0;
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      hitCount += 1;
    }
  }

  return hitCount >= 2;
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseJsonSafely(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractErrorMessage(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }

  const error = payload.error;
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }
  if (isRecord(error) && typeof error.message === "string" && error.message.trim()) {
    return error.message.trim();
  }

  return null;
}

function extractAnthropicReply(payload: unknown): string | null {
  if (!isRecord(payload) || !Array.isArray(payload.content)) {
    return null;
  }

  const textBlocks: string[] = [];
  for (const block of payload.content) {
    if (!isRecord(block)) {
      continue;
    }
    if (block.type === "text" && typeof block.text === "string" && block.text.trim()) {
      textBlocks.push(block.text.trim());
    }
  }

  return textBlocks.length > 0 ? normalizeReply(textBlocks.join("\n\n")) : null;
}

function extractOpenAiReply(payload: unknown): string | null {
  if (!isRecord(payload) || !Array.isArray(payload.choices) || payload.choices.length === 0) {
    return null;
  }

  const firstChoice = payload.choices[0];
  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    return null;
  }

  const content = firstChoice.message.content;
  if (typeof content === "string" && content.trim()) {
    return normalizeReply(content);
  }

  if (Array.isArray(content)) {
    const textParts: string[] = [];
    for (const part of content) {
      if (!isRecord(part)) {
        continue;
      }
      if (part.type === "text" && typeof part.text === "string" && part.text.trim()) {
        textParts.push(part.text.trim());
      }
    }
    if (textParts.length > 0) {
      return normalizeReply(textParts.join("\n\n"));
    }
  }

  return null;
}

function devWarn(message: string, extra?: unknown) {
  if (process.env.NODE_ENV !== "production" || forceAiLogs) {
    if (extra !== undefined) {
      console.warn(`[ai-concierge] ${message}`, extra);
      return;
    }
    console.warn(`[ai-concierge] ${message}`);
  }
}

async function callAnthropicEndpoint(message: string): Promise<string | null> {
  const response = await fetchWithTimeout(
    buildApiUrl(claudeBaseUrl, "/v1/messages"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": claudeApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: claudeModel,
        system: conciergeSystemPrompt,
        temperature: 0.25,
        max_tokens: 800,
        messages: [{ role: "user", content: message }],
      }),
    },
    claudeTimeoutMs,
  );

  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    devWarn(`Anthropic-compatible endpoint failed: ${response.status}`, extractErrorMessage(payload));
    return null;
  }

  return extractAnthropicReply(payload);
}

async function callOpenAiEndpoint(message: string): Promise<string | null> {
  const response = await fetchWithTimeout(
    buildApiUrl(claudeBaseUrl, "/v1/chat/completions"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${claudeApiKey}`,
      },
      body: JSON.stringify({
        model: claudeModel,
        temperature: 0.25,
        max_tokens: 800,
        messages: [
          { role: "system", content: conciergeSystemPrompt },
          { role: "user", content: message },
        ],
      }),
    },
    claudeTimeoutMs,
  );

  const payload = await parseJsonSafely(response);
  if (!response.ok) {
    devWarn(`OpenAI-compatible endpoint failed: ${response.status}`, extractErrorMessage(payload));
    return null;
  }

  return extractOpenAiReply(payload);
}

async function generateClaudeReply(message: string): Promise<string | null> {
  if (!claudeApiKey) {
    devWarn("Claude API key is missing; falling back to FAQ mode.");
    return null;
  }

  try {
    if (claudeApiStyle === "anthropic") {
      return await callAnthropicEndpoint(message);
    }
    if (claudeApiStyle === "openai") {
      return await callOpenAiEndpoint(message);
    }

    const anthropicReply = await callAnthropicEndpoint(message);
    if (anthropicReply) {
      return anthropicReply;
    }

    return await callOpenAiEndpoint(message);
  } catch (error) {
    devWarn("Claude request failed", error instanceof Error ? error.message : error);
    return null;
  }
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  const blockedByOrigin = guardSameOrigin(req);
  if (blockedByOrigin) {
    return blockedByOrigin;
  }

  const ip = getClientIpFromRequest(req) ?? "unknown";
  const fingerprint = getRateLimitFingerprint(req, ip);
  const rateLimit = consumeRateLimit({
    key: `ai:concierge:${fingerprint}`,
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, message: "提問太頻繁，請稍後再試。" },
      { status: 429 },
    );
  }

  const burstRateLimit = consumeRateLimit({
    key: `ai:concierge:burst:${fingerprint}`,
    limit: 8,
    windowMs: 60 * 1000,
  });
  if (!burstRateLimit.allowed) {
    return NextResponse.json(
      { ok: false, message: "提問太密集，請稍後約一分鐘再試。" },
      { status: 429 },
    );
  }

  try {
    const body = askSchema.parse(await req.json());
    const knowledgeMatch = pickKnowledgeMatch(body.message);
    if (looksLikePromptInjection(body.message)) {
      return NextResponse.json({
        ok: true,
        reply:
          "這則訊息包含疑似越權控制或機密索取指令，我無法協助。請改成具體需求，例如：登入流程、後台操作、程式問題排查。",
        links: [
          { label: "前往會員登入", href: "/auth" },
          { label: "聯絡我們", href: "/contact" },
        ],
      });
    }

    if (knowledgeMatch.score >= 5) {
      return NextResponse.json({
        ok: true,
        reply: knowledgeMatch.answer.reply,
        links: knowledgeMatch.answer.links ?? [],
      });
    }

    const aiReply = await generateClaudeReply(body.message);
    const fallbackAnswer =
      !aiReply && knowledgeMatch.score === 0 ? buildGuidedFallback(body.message) : knowledgeMatch.answer;
    const reply = aiReply ?? fallbackAnswer.reply;
    const links = knowledgeMatch.score >= 3 ? (knowledgeMatch.answer.links ?? []) : aiReply ? [] : fallbackAnswer.links;

    return NextResponse.json({
      ok: true,
      reply,
      links: links ?? GENERIC_LINKS,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: error.issues[0]?.message ?? "問題格式錯誤。" },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: false, message: "AI 客服暫時無法回應。" }, { status: 500 });
  }
}
