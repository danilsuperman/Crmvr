import { Router } from "express";
import { db, zonesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateZoneBody,
  UpdateZoneBody,
  UpdateZoneParams,
  DeleteZoneParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const zones = await db.select().from(zonesTable).orderBy(zonesTable.id);
  res.json(zones);
});

router.post("/", async (req, res) => {
  const parsed = CreateZoneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [zone] = await db.insert(zonesTable).values(parsed.data).returning();
  res.status(201).json(zone);
});

router.patch("/:id", async (req, res) => {
  const params = UpdateZoneParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateZoneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [zone] = await db
    .update(zonesTable)
    .set(parsed.data)
    .where(eq(zonesTable.id, params.data.id))
    .returning();
  if (!zone) {
    res.status(404).json({ error: "Zone not found" });
    return;
  }
  res.json(zone);
});

router.delete("/:id", async (req, res) => {
  const params = DeleteZoneParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(zonesTable).where(eq(zonesTable.id, params.data.id));
  res.status(204).send();
});

export default router;
