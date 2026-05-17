import { Router } from "express";
import { db, sessionTypesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateSessionTypeBody,
  UpdateSessionTypeBody,
  UpdateSessionTypeParams,
  DeleteSessionTypeParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const types = await db.select().from(sessionTypesTable).orderBy(sessionTypesTable.id);
  res.json(types);
});

router.post("/", async (req, res) => {
  const parsed = CreateSessionTypeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [type] = await db.insert(sessionTypesTable).values(parsed.data).returning();
  res.status(201).json(type);
});

router.patch("/:id", async (req, res) => {
  const params = UpdateSessionTypeParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateSessionTypeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [type] = await db
    .update(sessionTypesTable)
    .set(parsed.data)
    .where(eq(sessionTypesTable.id, params.data.id))
    .returning();
  if (!type) {
    res.status(404).json({ error: "Session type not found" });
    return;
  }
  res.json(type);
});

router.delete("/:id", async (req, res) => {
  const params = DeleteSessionTypeParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(sessionTypesTable).where(eq(sessionTypesTable.id, params.data.id));
  res.status(204).send();
});

export default router;
