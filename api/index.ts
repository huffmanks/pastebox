import { Hono } from "hono";
import fs from "node:fs";
import path from "node:path";

const app = new Hono().basePath("/api");

app.get("/hello", (c) => c.json({ message: "Hello from Hono!" }));

app.post("/upload", async (c) => {
  const body = await c.req.parseBody();
  const file = body.file;
  if (!(file instanceof File)) return c.text("no file", 400);
  fs.mkdirSync("./uploads", { recursive: true });
  fs.writeFileSync(path.join("./uploads", file.name), Buffer.from(await file.arrayBuffer()));
  return c.json({ ok: true });
});

export default app;
