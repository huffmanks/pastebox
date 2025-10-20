import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { drops } from "./db/schema.js";

export type Drop = InferSelectModel<typeof drops>;
export type NewDrop = InferInsertModel<typeof drops>;
