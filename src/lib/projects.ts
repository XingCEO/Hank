import { randomBytes } from "node:crypto";

export function generateProjectCode(): string {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = randomBytes(3).toString("hex").toUpperCase();
  return `PJ-${timePart}${randomPart}`;
}
