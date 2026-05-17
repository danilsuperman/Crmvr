import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id"),
  clientName: text("client_name"),
  clientPhone: text("client_phone"),
  zoneId: integer("zone_id"),
  sessionTypeId: integer("session_type_id"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  guestsCount: integer("guests_count").notNull().default(1),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  adminName: text("admin_name"),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
