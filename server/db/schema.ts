import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const drops = pgTable("drops", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  content: text("content"),
  password: text("password"),
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const files = pgTable("files", {
  id: text("id").primaryKey(),
  dropId: text("drop_id")
    .notNull()
    .references(() => drops.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  fileName: text("file_name").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
});
