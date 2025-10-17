import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import app from "./api/index";

const server = new Hono();
server.route("/api", app);
server.use("*", serveStatic({ root: "./dist" }));
server.get("*", (c) => c.redirect("/"));

serve(server);
