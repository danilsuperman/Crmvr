import { Router } from "express";
import { db, bookingsTable, zonesTable, sessionTypesTable } from "@workspace/db";
import { eq, and, gte, lt, ne } from "drizzle-orm";
import {
  CreateBookingBody,
  UpdateBookingBody,
  ListBookingsQueryParams,
  GetBookingParams,
  UpdateBookingParams,
  DeleteBookingParams,
} from "@workspace/api-zod";

const router = Router();

function formatBooking(b: {
  id: number;
  clientId: number | null;
  clientName: string | null;
  clientPhone: string | null;
  zoneId: number | null;
  sessionTypeId: number | null;
  startTime: Date;
  endTime: Date;
  guestsCount: number;
  status: string;
  notes: string | null;
  adminName: string | null;
  zoneName?: string | null;
  zoneColor?: string | null;
  sessionTypeName?: string | null;
  sessionTypeColor?: string | null;
}) {
  return {
    ...b,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const query = ListBookingsQueryParams.safeParse(req.query);

  const conditions = [];

  if (query.success && query.data.date) {
    const date = new Date(query.data.date);
    const dayStart = new Date(date);
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setUTCHours(23, 59, 59, 999);
    conditions.push(gte(bookingsTable.startTime, dayStart));
    conditions.push(lt(bookingsTable.startTime, dayEnd));
  }

  if (query.success && query.data.zoneId) {
    conditions.push(eq(bookingsTable.zoneId, Number(query.data.zoneId)));
  }

  const bookings = await db
    .select({
      id: bookingsTable.id,
      clientId: bookingsTable.clientId,
      clientName: bookingsTable.clientName,
      clientPhone: bookingsTable.clientPhone,
      zoneId: bookingsTable.zoneId,
      sessionTypeId: bookingsTable.sessionTypeId,
      startTime: bookingsTable.startTime,
      endTime: bookingsTable.endTime,
      guestsCount: bookingsTable.guestsCount,
      status: bookingsTable.status,
      notes: bookingsTable.notes,
      adminName: bookingsTable.adminName,
      zoneName: zonesTable.name,
      zoneColor: zonesTable.color,
      sessionTypeName: sessionTypesTable.name,
      sessionTypeColor: sessionTypesTable.color,
    })
    .from(bookingsTable)
    .leftJoin(zonesTable, eq(bookingsTable.zoneId, zonesTable.id))
    .leftJoin(sessionTypesTable, eq(bookingsTable.sessionTypeId, sessionTypesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(bookingsTable.startTime);

  res.json(bookings.map(formatBooking));
});

router.post("/", async (req, res) => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;

  if (data.zoneId && data.startTime && data.endTime) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const conflicts = await db
      .select()
      .from(bookingsTable)
      .where(
        and(
          eq(bookingsTable.zoneId, data.zoneId),
          ne(bookingsTable.status, "cancelled"),
          lt(bookingsTable.startTime, end),
          gte(bookingsTable.endTime, start)
        )
      );

    if (conflicts.length > 0) {
      res.status(409).json({
        error: "Booking conflicts with existing booking",
        conflictingIds: conflicts.map((c) => c.id),
      });
      return;
    }
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    })
    .returning();

  const [full] = await db
    .select({
      id: bookingsTable.id,
      clientId: bookingsTable.clientId,
      clientName: bookingsTable.clientName,
      clientPhone: bookingsTable.clientPhone,
      zoneId: bookingsTable.zoneId,
      sessionTypeId: bookingsTable.sessionTypeId,
      startTime: bookingsTable.startTime,
      endTime: bookingsTable.endTime,
      guestsCount: bookingsTable.guestsCount,
      status: bookingsTable.status,
      notes: bookingsTable.notes,
      adminName: bookingsTable.adminName,
      zoneName: zonesTable.name,
      zoneColor: zonesTable.color,
      sessionTypeName: sessionTypesTable.name,
      sessionTypeColor: sessionTypesTable.color,
    })
    .from(bookingsTable)
    .leftJoin(zonesTable, eq(bookingsTable.zoneId, zonesTable.id))
    .leftJoin(sessionTypesTable, eq(bookingsTable.sessionTypeId, sessionTypesTable.id))
    .where(eq(bookingsTable.id, booking.id));

  res.status(201).json(formatBooking(full));
});

router.get("/:id", async (req, res) => {
  const params = GetBookingParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [booking] = await db
    .select({
      id: bookingsTable.id,
      clientId: bookingsTable.clientId,
      clientName: bookingsTable.clientName,
      clientPhone: bookingsTable.clientPhone,
      zoneId: bookingsTable.zoneId,
      sessionTypeId: bookingsTable.sessionTypeId,
      startTime: bookingsTable.startTime,
      endTime: bookingsTable.endTime,
      guestsCount: bookingsTable.guestsCount,
      status: bookingsTable.status,
      notes: bookingsTable.notes,
      adminName: bookingsTable.adminName,
      zoneName: zonesTable.name,
      zoneColor: zonesTable.color,
      sessionTypeName: sessionTypesTable.name,
      sessionTypeColor: sessionTypesTable.color,
    })
    .from(bookingsTable)
    .leftJoin(zonesTable, eq(bookingsTable.zoneId, zonesTable.id))
    .leftJoin(sessionTypesTable, eq(bookingsTable.sessionTypeId, sessionTypesTable.id))
    .where(eq(bookingsTable.id, params.data.id));

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  res.json(formatBooking(booking));
});

router.patch("/:id", async (req, res) => {
  const params = UpdateBookingParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;

  if (data.zoneId !== undefined || data.startTime !== undefined || data.endTime !== undefined) {
    const existing = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, params.data.id));

    if (existing.length > 0) {
      const current = existing[0];
      const zoneId = data.zoneId ?? current.zoneId;
      const start = data.startTime ? new Date(data.startTime) : current.startTime;
      const end = data.endTime ? new Date(data.endTime) : current.endTime;

      if (zoneId) {
        const conflicts = await db
          .select()
          .from(bookingsTable)
          .where(
            and(
              eq(bookingsTable.zoneId, zoneId),
              ne(bookingsTable.status, "cancelled"),
              ne(bookingsTable.id, params.data.id),
              lt(bookingsTable.startTime, end),
              gte(bookingsTable.endTime, start)
            )
          );

        if (conflicts.length > 0) {
          res.status(409).json({
            error: "Booking conflicts with existing booking",
            conflictingIds: conflicts.map((c) => c.id),
          });
          return;
        }
      }
    }
  }

  const updateData: Record<string, unknown> = { ...data };
  if (data.startTime) updateData.startTime = new Date(data.startTime);
  if (data.endTime) updateData.endTime = new Date(data.endTime);

  await db
    .update(bookingsTable)
    .set(updateData)
    .where(eq(bookingsTable.id, params.data.id));

  const [updated] = await db
    .select({
      id: bookingsTable.id,
      clientId: bookingsTable.clientId,
      clientName: bookingsTable.clientName,
      clientPhone: bookingsTable.clientPhone,
      zoneId: bookingsTable.zoneId,
      sessionTypeId: bookingsTable.sessionTypeId,
      startTime: bookingsTable.startTime,
      endTime: bookingsTable.endTime,
      guestsCount: bookingsTable.guestsCount,
      status: bookingsTable.status,
      notes: bookingsTable.notes,
      adminName: bookingsTable.adminName,
      zoneName: zonesTable.name,
      zoneColor: zonesTable.color,
      sessionTypeName: sessionTypesTable.name,
      sessionTypeColor: sessionTypesTable.color,
    })
    .from(bookingsTable)
    .leftJoin(zonesTable, eq(bookingsTable.zoneId, zonesTable.id))
    .leftJoin(sessionTypesTable, eq(bookingsTable.sessionTypeId, sessionTypesTable.id))
    .where(eq(bookingsTable.id, params.data.id));

  if (!updated) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  res.json(formatBooking(updated));
});

router.delete("/:id", async (req, res) => {
  const params = DeleteBookingParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(bookingsTable).where(eq(bookingsTable.id, params.data.id));
  res.status(204).send();
});

export default router;
