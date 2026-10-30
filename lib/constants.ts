import path from "node:path";

export const EXPIRY_TIME = 24 * 60 * 60 * 1000;

export const SLUG_OPTIONS = {
  lower: true,
  strict: true,
  trim: true,
};

export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export const SHARE_API_META = { title: "Share note", text: "Access you box." };
