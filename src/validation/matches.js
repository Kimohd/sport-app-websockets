import { z } from "zod";

// ─── Constants ───────────────────────────────────────────────────────

export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE:      "live",
  FINISHED:  "finished",
};

// ─── Helpers ───────────────────────────────────────────────────────
const isoDateString = z.iso.datetime({
  message: "Must be a valid ISO 8601 datetime string",
  });

const coercedPositiveInt = z.coerce
  .number()
  .int()
  .positive();

const coercedNonNegativeInt = z.coerce
  .number()
  .int()
  .min(0);

// ─── Schemas ───────────────────────────────────────────────────────
export const listMatchesQuerySchema = z.object({
  limit: coercedPositiveInt.max(100).optional(),
});

export const matchIdParamSchema = z.object({
  id: coercedPositiveInt,
});

export const createMatchSchema = z
  .object({
    sport:     z.string().min(1, { message: "sport is required" }),
    homeTeam:  z.string().min(1, { message: "homeTeam is required" }),
    awayTeam:  z.string().min(1, { message: "awayTeam is required" }),
    startTime: isoDateString,
    endTime:   isoDateString,
    homeScore: coercedNonNegativeInt.optional(),
    awayScore: coercedNonNegativeInt.optional(),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startTime);
    const end   = new Date(data.endTime);

    if (end <= start) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        path:    ["endTime"],
        message: "endTime must be chronologically after startTime",
      });
    }
  });

export const updateScoreSchema = z.object({
  homeScore: coercedNonNegativeInt,
  awayScore: coercedNonNegativeInt,
});