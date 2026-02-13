export function generateProjectCode(): string {
  const seed = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
  return `PJ-${seed}`;
}
