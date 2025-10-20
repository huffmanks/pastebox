import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { nanoid } from "nanoid";
import fs from "node:fs";
import path from "node:path";
import type { Drop, NewDrop } from "./types.js";

const app = new Hono();

app.use(logger());

const drops = new Map<string, Drop>();
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const EXPIRY_TIME = 24 * 60 * 60 * 1000;

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

setInterval(() => {
  const now = Date.now();
  for (const [id, drop] of drops.entries()) {
    if (drop.expiresAt.getTime() < now) {
      if (drop.filePath && fs.existsSync(drop.filePath)) {
        fs.unlinkSync(drop.filePath);
      }
      drops.delete(id);
    }
  }
}, 60 * 60 * 1000);

// API Routes
app.get("/api/hello", (c) => c.json({ message: "Hello from Hono!" }));

app.post("/api/drop", async (c) => {
  console.log(c);
  const body = await c.req.parseBody();
  const id = nanoid(8);
  const now = Date.now();

  if (body.content && typeof body.content === "string") {
    const drop: NewDrop = {
      id,
      slug: (body.slug as string) || id,
      type: "text",
      title: (body.title as string) || "",
      content: (body.content as string) || null,
      expiresAt: new Date(now + EXPIRY_TIME),
    };

    drops.set(id, drop);
    return c.json({ id, slug: drop.slug });
  } else if (body.file instanceof File) {
    const file = body.file;
    const fileName = file.name || "unnamed";
    const filePath = path.join(UPLOAD_DIR, `${id}_${fileName}`);
    const mimeType = file.type || "unknown";
    const size = file.size || null;

    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    const drop: NewDrop = {
      id,
      slug: (body.slug as string) || id,
      type: "file",
      title: fileName,
      content: null,
      filePath,
      mimeType,
      size,
      expiresAt: new Date(now + EXPIRY_TIME),
    };
    drops.set(id, drop);
    return c.json({ id, slug: drop.slug, title: fileName });
  }

  return c.json({ error: "Invalid request" }, 400);
});

app.get("/api/drop/:id", (c) => {
  const id = c.req.param("id");
  const drop = drops.get(id);

  if (!drop) {
    return c.json({ error: "Not found" }, 404);
  }

  if (drop.expiresAt.getTime() < Date.now()) {
    if (drop.filePath && fs.existsSync(drop.filePath)) {
      fs.unlinkSync(drop.filePath);
    }
    drops.delete(id);
    return c.json({ error: "Expired" }, 404);
  }

  if (drop.type === "text") {
    return c.json({ type: "text", content: drop.content });
  } else {
    return c.json({ type: "file", filename: drop.title });
  }
});

app.get("/api/download/:id", (c) => {
  const id = c.req.param("id");
  const drop = drops.get(id);

  if (!drop || drop.type !== "file" || !drop.filePath) {
    return c.json({ error: "Not found" }, 404);
  }

  if (drop.expiresAt.getTime() < Date.now()) {
    if (fs.existsSync(drop.filePath)) {
      fs.unlinkSync(drop.filePath);
    }
    drops.delete(id);
    return c.json({ error: "Expired" }, 404);
  }

  if (!fs.existsSync(drop.filePath)) {
    return c.json({ error: "File not found" }, 404);
  }

  const file = fs.readFileSync(drop.filePath);
  return new Response(file, {
    headers: {
      "Content-Disposition": `attachment; filename="${drop.title}"`,
      "Content-Type": "application/octet-stream",
    },
  });
});

app.get("/api/stats", (c) => {
  return c.json({
    total: drops.size,
    texts: Array.from(drops.values()).filter((p) => p.type === "text").length,
    files: Array.from(drops.values()).filter((p) => p.type === "file").length,
  });
});

const server = serve({
  fetch: app.fetch,
  port: 5174,
});

export type AppType = typeof server;

export default server;
