import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

const SPECIAL_CHAR_PATTERN = /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]/;

export const passwordPolicySchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `密碼至少 ${PASSWORD_MIN_LENGTH} 碼。`)
  .max(PASSWORD_MAX_LENGTH, `密碼長度不可超過 ${PASSWORD_MAX_LENGTH} 碼。`)
  .regex(/[a-z]/, "密碼至少需包含一個小寫英文字母。")
  .regex(/[A-Z]/, "密碼至少需包含一個大寫英文字母。")
  .regex(/\d/, "密碼至少需包含一個數字。")
  .regex(SPECIAL_CHAR_PATTERN, "密碼至少需包含一個特殊符號。")
  .refine((value) => !/\s/.test(value), "密碼不可包含空白字元。");

export function isPasswordPolicySatisfied(password: string): boolean {
  return passwordPolicySchema.safeParse(password).success;
}
