import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { drops, files } from "./db/schema.js";

export type Drop = InferSelectModel<typeof drops>;
export type NewDrop = InferInsertModel<typeof drops>;
export type File = InferSelectModel<typeof files>;
export type NewFile = InferInsertModel<typeof files>;
