import { Router } from "express";
import { db, clientsTable, bookingsTable, zonesTable, sessionTypesTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";
import {
  CreateClientBody,
  UpdateClientBody,
  ListClientsQueryParams,
  GetClientParams,
  UpdateClientParams,
  DeleteClientParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const query = ListClientsQueryParams.safeParse(req.query);
  const search = query.success ? query.data.search : undefined;

  let clients;
  if (search) {
    clients = await db
      .select()
      .from(clientsTable)
      .where(
        or(
          ilike(clientsTable.name, `%${search}%`),
          ilike(clientsTable.phone, `%${search}%`)
        )
      )
      .orderBy(clientsTable.name);
  } else {
    clients = await db.select().from(clientsTable).orderBy(clientsTable.name);
  }

  const enriched = await Promise.all(
    clients.map(async (client) => {
      const bookings = await db
        .select()
        .from(bookingsTable)
        .where(eq(bookingsTable.clientId, client.id))
        .orderBy(bookingsTable.startTime);

      const visitCount = bookings.length;
      const lastVisit =
        bookings.length > 0
          ? bookings[bookings.length - 1].startTime?.toISOString()
          : null;

      return { ...client, visitCount, lastVisit };
    })
  );

  res.json(enriched);
});

router.post("/", async (req, res) => {
  const parsed = CreateClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [client] = await db.insert(clientsTable).values(parsed.data).returning();
  res.status(201).json({ ...client, visitCount: 0, lastVisit: null });
});

router.get("/:id", async (req, res) => {
  const params = GetClientParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [client] = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.id, params.data.id));

  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
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
    .where(eq(bookingsTable.clientId, params.data.id))
    .orderBy(sql`${bookingsTable.startTime} desc`);

  const visitCount = bookings.length;
  const lastVisit = bookings.length > 0 ? bookings[0].startTime?.toISOString() : null;

  const bookingsWithStrings = bookings.map((b) => ({
    ...b,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
  }));

  res.json({
    ...client,
    visitCount,
    lastVisit,
    bookings: bookingsWithStrings,
  });
});

router.patch("/:id", async (req, res) => {
  const params = UpdateClientParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [client] = await db
    .update(clientsTable)
    .set(parsed.data)
    .where(eq(clientsTable.id, params.data.id))
    .returning();
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  res.json({ ...client, visitCount: 0, lastVisit: null });
});

router.delete("/:id", async (req, res) => {
  const params = DeleteClientParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(clientsTable).where(eq(clientsTable.id, params.data.id));
  res.status(204).send();
});

export default router;
