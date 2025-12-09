import { eq } from "drizzle-orm";
import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import yazl from "yazl";

import { db } from "@/db";
import { boxes } from "@/db/schema";
import { UPLOADS_DIR } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const box = await db.query.boxes.findFirst({
      where: eq(boxes.id, id),
      with: { files: true },
    });

    if (!box) return new Response("Box not found.", { status: 404 });

    if (!box.files?.length) return new Response("No files found.", { status: 404 });

    if (new Date() > new Date(box.expiresAt))
      return new Response("This pastebox has expired!", { status: 410 });

    const zip = new yazl.ZipFile();
    for (const file of box.files) {
      const filePath = path.join(UPLOADS_DIR, file.name);
      zip.addFile(filePath, file.originalName);
    }

    const zipPath = `/tmp/${box.id}.zip`;
    const output = createWriteStream(zipPath);
    const zipStream = new Promise<void>((resolve, reject) => {
      output.on("close", resolve);
      output.on("error", reject);
    });
    zip.outputStream.pipe(output);
    zip.end();
    await zipStream;

    const zipData = await fs.readFile(zipPath);
    await fs.unlink(zipPath);

    return new Response(zipData, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${box.id}.zip"`,
      },
    });
  } catch (_error) {
    return new Response("There was an error!", {
      status: 400,
    });
  }
}
