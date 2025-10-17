import { Hono } from "hono";

const app = new Hono();

const api = app.basePath("/api");

api.get("/hello", (c) => {
  return c.json({
    message: "Hello",
  });
});

export default app;
