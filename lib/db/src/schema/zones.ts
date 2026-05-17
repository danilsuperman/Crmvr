import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const zonesTable = pgTable("zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6366f1"),
  capacity: integer("capacity").notNull().default(10),
  openTime: text("open_time"),
  closeTime: text("close_time"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertZoneSchema = createInsertSchema(zonesTable).omit({ id: true });
export type InsertZone = z.infer<typeof insertZoneSchema>;
export type Zone = typeof zonesTable.$inferSelect;
