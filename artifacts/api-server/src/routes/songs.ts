import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, songsTable } from "@workspace/db";
import {
  CreateSongBody,
  UpdateSongBody,
  UpdateSongParams,
  GetSongParams,
  DeleteSongParams,
  GetSongResponse,
  UpdateSongResponse,
  ListSongsResponse,
  CreateSongResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/songs", async (_req, res): Promise<void> => {
  const songs = await db
    .select()
    .from(songsTable)
    .orderBy(songsTable.createdAt);
  res.json(ListSongsResponse.parse(songs));
});

router.post("/songs", async (req, res): Promise<void> => {
  const parsed = CreateSongBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, artist, chordText, lyricsText } = parsed.data;
  const [song] = await db.insert(songsTable).values({ title, artist, chordText, lyricsText }).returning();
  res.status(201).json(CreateSongResponse.parse(song));
});

router.get("/songs/:id", async (req, res): Promise<void> => {
  const params = GetSongParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [song] = await db
    .select()
    .from(songsTable)
    .where(eq(songsTable.id, params.data.id));

  if (!song) {
    res.status(404).json({ error: "Song not found" });
    return;
  }

  res.json(GetSongResponse.parse(song));
});

router.patch("/songs/:id", async (req, res): Promise<void> => {
  const params = UpdateSongParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateSongBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [song] = await db
    .update(songsTable)
    .set(parsed.data)
    .where(eq(songsTable.id, params.data.id))
    .returning();

  if (!song) {
    res.status(404).json({ error: "Song not found" });
    return;
  }

  res.json(UpdateSongResponse.parse(song));
});

router.delete("/songs/:id", async (req, res): Promise<void> => {
  const params = DeleteSongParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [song] = await db
    .delete(songsTable)
    .where(eq(songsTable.id, params.data.id))
    .returning();

  if (!song) {
    res.status(404).json({ error: "Song not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
