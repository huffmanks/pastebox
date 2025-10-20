import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const drops = pgTable("drops", {
  id: varchar({ length: 8 }).primaryKey(),
  slug: varchar({ length: 30 }).notNull(),
  type: varchar({ length: 10 }).notNull(),
  title: varchar({ length: 120 }).notNull(),
  content: text(),
  filePath: varchar({ length: 512 }),
  mimeType: varchar({ length: 128 }),
  size: integer(),
  views: integer().default(0).notNull(),
  isPublic: boolean().default(true).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
});
