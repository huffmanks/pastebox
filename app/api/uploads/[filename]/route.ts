import fs from "fs/promises";
import path from "path";

import { UPLOADS_DIR } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), UPLOADS_DIR, filename);

  try {
    await fs.access(filePath);

    const file = await fs.readFile(filePath);
    return new Response(file);
  } catch (_error) {
    return new Response("Something went wrong!", {
      status: 400,
    });
  }
}
