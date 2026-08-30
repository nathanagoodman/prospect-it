import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(3)
  .max(254)
  .email("Enter a valid email address")
  .transform((v) => v.toLowerCase());

/**
 * Password policy: length is the property that actually matters, so the
 * floor is 8 with a nudge toward longer rather than a maze of character
 * class rules that push people toward "Passw0rd!".
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(200, "Password is too long");

export const waitlistSchema = z.object({
  email: emailSchema,
  name: z.string().trim().max(120).optional().nullable(),
  company: z.string().trim().max(160).optional().nullable(),
  trade: z.string().trim().max(80).optional().nullable(),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().max(120).optional().nullable(),
  company: z.string().trim().max(160).optional().nullable(),
  tradeType: z.string().trim().max(80).optional().nullable(),
  tier: z.enum(["GC", "TRADE"], {
    message: "Select whether you're a GC or a trade",
  }),
  enabledTrades: z.array(z.string().max(80)).max(40).optional().default([]),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password: passwordSchema,
});

/** Formats a ZodError into a single human-readable message. */
export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
