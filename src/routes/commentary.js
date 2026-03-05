import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { matches, commentary } from "../db/schema.js";
import { matchIdParamSchema, } from "../validation/matches.js";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/commentary.js";

export const commentaryRouter = new Router({ mergeParams: true });

const MAX_LIMIT = 100;

// GET /matches/:id/commentary ──────────────────────────────────────────────
commentaryRouter.get("/", async (req, res) => {
  const parsedParams = matchIdParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return res.status(400).json({
      error:   "Invalid match ID.",
      details: parsedParams.error.issues,
    });
  }

  const parsedQuery = listCommentaryQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return res.status(400).json({
      error:   "Invalid query.",
      details: parsedQuery.error.issues,
    });
  }

  const { id: matchId } = parsedParams.data;

  const limit = Math.min(parsedQuery.data.limit ?? MAX_LIMIT, MAX_LIMIT);

   // 1. Check match exists — query matches table, filter by matches.id

  try {
    const match = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(limit);

    if (!match.length) {
      return res.status(404).json({ error: "Match not found." });
    }
    
    // 2. Fetch commentary — query commentary table, filter by commentary.matchId

    const data = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);

    res.json({ data });

  } catch (e) {

  console.error("GET /commentary error:", e);
  
  res.status(500).json({
    error:   "Failed to list commentary.",
    details: JSON.stringify(e, Object.getOwnPropertyNames(e)),
  });
}
});

// POST /matches/:id/commentary ─────────────────────────────────────────────

commentaryRouter.post("/", async (req, res) => {
  const parsedParams = matchIdParamSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return res.status(400).json({
      error:   "Invalid match ID.",
      details: parsedParams.error.issues,
    });
  }

  const parsedBody = createCommentarySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      error:   "Invalid payload.",
      details: parsedBody.error.issues,
    });
  }

  const { id: matchId } = parsedParams.data;

  try {
    const match = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId))
      .limit(1);

    if (!match.length) {
      return res.status(404).json({ error: "Match not found." });
    }

    const [result] = await db
      .insert(commentary)
      .values({ ...parsedBody.data, matchId })
      .returning();

    if(res.app.locals.broadcastCommentary){
        res.app.locals.broadcastCommentary(Number(result.matchId), result);
    }  

    res.status(201).json({ data: result });
  } catch (e) {
    console.error("POST /commentary error:", e); // 👈 add
    res.status(500).json({
      error:   "Failed to create commentary event.",
      details: JSON.stringify(e, Object.getOwnPropertyNames(e)),
    });
  }
});