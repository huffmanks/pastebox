import { serve } from "@hono/node-server";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { nanoid } from "nanoid";
import fs from "node:fs";
import path from "node:path";

import { db } from "./db/index.js";
import { drops, files } from "./db/schema.js";

const app = new Hono();

app.use(logger());

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const EXPIRY_TIME = 24 * 60 * 60 * 1000;

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// setInterval(() => {
//   const now = Date.now();
//   for (const [id, drop] of drops.entries()) {
//     if (drop.expiresAt.getTime() < now) {
//       if (drop.filePath && fs.existsSync(drop.filePath)) {
//         fs.unlinkSync(drop.filePath);
//       }
//       drops.delete(id);
//     }
//   }
// }, 60 * 60 * 1000);

app.post("/api/drop", async (c) => {
  const body = await c.req.parseBody();
  const dropId = nanoid(8);
  const now = Date.now();
  const expiresAt = new Date(now + EXPIRY_TIME);

  const { slug, content, password, files: uploadedFiles } = body;

  await db.insert(drops).values({
    id: dropId,
    slug: (slug as string) || dropId,
    content: content ?? null,
    password: password ?? null,
    expiresAt,
  });

  if (Array.isArray(uploadedFiles) && uploadedFiles.length) {
    await Promise.all(
      uploadedFiles.map(async (file: any) => {
        const fileName = file.name || "unnamed";
        const filePath = path.join(UPLOAD_DIR, `${dropId}_${fileName}`);
        const buffer = await file.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));
        const fileRecord = {
          id: nanoid(12),
          dropId,
          filePath,
          mimeType: file.type || file.mimeType || "application/octet-stream",
          size: typeof file.size === "number" ? file.size : Buffer.byteLength(Buffer.from(buffer)),
          fileName,
          uploadedAt: new Date(now),
        };
        await db.insert(files).values(fileRecord);
      })
    );
  }

  return c.json({ success: true, dropId });
});

app.get("/api/drop/:id", async (c) => {
  const id = c.req.param("id");
  const drop = await db.query.drops.findFirst({
    where: eq(drops.id, id),
    with: { files: true },
  });

  if (!drop) return c.json({ error: "Not found" }, 404);

  await db
    .update(drops)
    .set({ views: drop.views + 1 })
    .where(eq(drops.id, id));

  if (new Date() > new Date(drop.expiresAt)) return c.json({ error: "Expired" }, 410);

  return c.json(drop);
});

app.get("/api/download/:id", async (c) => {
  const id = c.req.param("id");
  const file = await db.query.files.findFirst({ where: eq(files.id, id) });
  if (!file) return c.json({ error: "Not found" }, 404);

  const drop = await db.query.drops.findFirst({ where: eq(drops.id, file.dropId) });
  if (!drop) return c.json({ error: "Drop missing" }, 404);
  if (new Date() > new Date(drop.expiresAt)) return c.json({ error: "Expired" }, 410);

  const filePath = file.filePath;
  if (!fs.existsSync(filePath)) return c.json({ error: "File missing" }, 404);

  return c.body(fs.readFileSync(filePath), 200, {
    "Content-Type": file.mimeType,
    "Content-Disposition": `attachment; filename="${file.fileName}"`,
  });
});

const server = serve({
  fetch: app.fetch,
  port: 5174,
});

export type AppType = typeof server;

export default server;
