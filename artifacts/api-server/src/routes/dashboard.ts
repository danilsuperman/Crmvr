import { Router } from "express";
import { db, bookingsTable, zonesTable, eventsTable } from "@workspace/db";
import { eq, and, gte, lt, sql } from "drizzle-orm";
import { GetDashboardSummaryQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/summary", async (req, res) => {
  const query = GetDashboardSummaryQueryParams.safeParse(req.query);
  const dateStr =
    query.success && query.data.date
      ? query.data.date
      : new Date().toISOString().split("T")[0];

  const date = new Date(dateStr);
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(
      and(
        gte(bookingsTable.startTime, dayStart),
        lt(bookingsTable.startTime, dayEnd)
      )
    );

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;
  const totalGuests = bookings.reduce((sum, b) => sum + b.guestsCount, 0);

  const zones = await db
    .select()
    .from(zonesTable)
    .where(eq(zonesTable.isActive, true));

  const zoneStats = zones.map((zone) => {
    const zoneBookings = bookings.filter((b) => b.zoneId === zone.id);
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      zoneColor: zone.color,
      bookingCount: zoneBookings.length,
    };
  });

  const now = new Date();
  const upcomingResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(eventsTable)
    .where(
      and(
        gte(eventsTable.startTime, now),
        eq(eventsTable.status, "planned")
      )
    );
  const upcomingEvents = Number(upcomingResult[0]?.count ?? 0);

  res.json({
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    totalGuests,
    zoneStats,
    upcomingEvents,
  });
});

export default router;
