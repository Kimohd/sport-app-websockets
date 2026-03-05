import { z } from "zod";

// ─── Helpers ───────────────────────────────────────────────────────────

const coercedPositiveInt    = z.coerce.number().int().positive();
const coercedNonNegativeInt = z.coerce.number().int().min(0);

// ─── Schemas ───────────────────────────────────────────────────────────

export const listCommentaryQuerySchema = z.object({
  limit: coercedPositiveInt.max(100).optional(),
});

export const createCommentarySchema = z.object({
  minute:    coercedNonNegativeInt.optional(),
  sequence:  coercedPositiveInt,
  period:    z.string().min(1, { message: "period is required" }).optional(),
  eventType: z.string().min(1, { message: "eventType is required" }),
  actor:     z.string().min(1, { message: "actor is required" }).optional(),
  team:      z.string().min(1, { message: "team is required" }).optional(),
  message:   z.string().min(1, { message: "message is required" }),
  metadata:  z.record(z.string(), z.unknown()).optional(),
  tags:      z.array(z.string()).optional(),
});