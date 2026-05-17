import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  guestsCount: integer("guests_count").notNull().default(1),
  status: text("status").notNull().default("planned"),
  zones: text("zones"),
  responsible: text("responsible"),
});

export const eventStagesTable = pgTable("event_stages", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes"),
  orderIndex: integer("order_index").notNull().default(0),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true });
export const insertEventStageSchema = createInsertSchema(eventStagesTable).omit({ id: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertEventStage = z.infer<typeof insertEventStageSchema>;
export type Event = typeof eventsTable.$inferSelect;
export type EventStage = typeof eventStagesTable.$inferSelect;
