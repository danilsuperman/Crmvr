import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionTypesTable = pgTable("session_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#8b5cf6"),
  minDuration: integer("min_duration").notNull().default(30),
});

export const insertSessionTypeSchema = createInsertSchema(sessionTypesTable).omit({ id: true });
export type InsertSessionType = z.infer<typeof insertSessionTypeSchema>;
export type SessionType = typeof sessionTypesTable.$inferSelect;
