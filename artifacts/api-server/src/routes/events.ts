import { Router } from "express";
import { db, eventsTable, eventStagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateEventBody,
  UpdateEventBody,
  GetEventParams,
  UpdateEventParams,
  DeleteEventParams,
  AddEventStageParams,
  AddEventStageBody,
  UpdateEventStageParams,
  UpdateEventStageBody,
  DeleteEventStageParams,
} from "@workspace/api-zod";

const router = Router();

function formatEvent(e: {
  id: number;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  guestsCount: number;
  status: string;
  zones: string | null;
  responsible: string | null;
}) {
  return {
    ...e,
    startTime: e.startTime.toISOString(),
    endTime: e.endTime.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const events = await db
    .select()
    .from(eventsTable)
    .orderBy(eventsTable.startTime);
  res.json(events.map(formatEvent));
});

router.post("/", async (req, res) => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const [event] = await db
    .insert(eventsTable)
    .values({
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      status: data.status ?? "planned",
    })
    .returning();
  res.status(201).json(formatEvent(event));
});

router.get("/:id", async (req, res) => {
  const params = GetEventParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [event] = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.id, params.data.id));

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const stages = await db
    .select()
    .from(eventStagesTable)
    .where(eq(eventStagesTable.eventId, params.data.id))
    .orderBy(eventStagesTable.orderIndex);

  res.json({ ...formatEvent(event), stages });
});

router.patch("/:id", async (req, res) => {
  const params = UpdateEventParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = { ...data };
  if (data.startTime) updateData.startTime = new Date(data.startTime);
  if (data.endTime) updateData.endTime = new Date(data.endTime);

  const [event] = await db
    .update(eventsTable)
    .set(updateData)
    .where(eq(eventsTable.id, params.data.id))
    .returning();

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(formatEvent(event));
});

router.delete("/:id", async (req, res) => {
  const params = DeleteEventParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(eventStagesTable).where(eq(eventStagesTable.eventId, params.data.id));
  await db.delete(eventsTable).where(eq(eventsTable.id, params.data.id));
  res.status(204).send();
});

router.post("/:id/stages", async (req, res) => {
  const params = AddEventStageParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = AddEventStageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [stage] = await db
    .insert(eventStagesTable)
    .values({ ...parsed.data, eventId: params.data.id })
    .returning();
  res.status(201).json(stage);
});

router.patch("/:id/stages/:stageId", async (req, res) => {
  const params = UpdateEventStageParams.safeParse({
    id: Number(req.params.id),
    stageId: Number(req.params.stageId),
  });
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  const parsed = UpdateEventStageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [stage] = await db
    .update(eventStagesTable)
    .set(parsed.data)
    .where(eq(eventStagesTable.id, params.data.stageId))
    .returning();
  if (!stage) {
    res.status(404).json({ error: "Stage not found" });
    return;
  }
  res.json(stage);
});

router.delete("/:id/stages/:stageId", async (req, res) => {
  const params = DeleteEventStageParams.safeParse({
    id: Number(req.params.id),
    stageId: Number(req.params.stageId),
  });
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }
  await db
    .delete(eventStagesTable)
    .where(eq(eventStagesTable.id, params.data.stageId));
  res.status(204).send();
});

export default router;
