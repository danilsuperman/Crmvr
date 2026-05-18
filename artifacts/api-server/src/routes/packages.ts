import { Router } from "express";
import { db, packagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreatePackageBody,
  UpdatePackageBody,
  UpdatePackageParams,
  DeletePackageParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (_req, res) => {
  const packages = await db.select().from(packagesTable).orderBy(packagesTable.id);
  res.json(packages);
});

router.post("/", async (req, res) => {
  const parsed = CreatePackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const [pkg] = await db
    .insert(packagesTable)
    .values({
      name: data.name,
      description: data.description ?? null,
      zoneIds: JSON.stringify(data.zoneIds ?? []),
      maxGuests: data.maxGuests,
    })
    .returning();
  res.status(201).json({ ...pkg, zoneIds: JSON.parse(pkg.zoneIds) });
});

router.patch("/:id", async (req, res) => {
  const params = UpdatePackageParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdatePackageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.zoneIds !== undefined) updateData.zoneIds = JSON.stringify(data.zoneIds);
  if (data.maxGuests !== undefined) updateData.maxGuests = data.maxGuests;

  await db.update(packagesTable).set(updateData).where(eq(packagesTable.id, params.data.id));
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, params.data.id));
  if (!pkg) { res.status(404).json({ error: "Package not found" }); return; }
  res.json({ ...pkg, zoneIds: JSON.parse(pkg.zoneIds) });
});

router.delete("/:id", async (req, res) => {
  const params = DeletePackageParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(packagesTable).where(eq(packagesTable.id, params.data.id));
  res.status(204).send();
});

export default router;
