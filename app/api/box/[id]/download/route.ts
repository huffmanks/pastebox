import { eq } from "drizzle-orm";
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
      zip.addFile(path.join(UPLOADS_DIR, file.name), file.originalName);
    }

    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        zip.outputStream.on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });

        zip.outputStream.on("end", () => controller.close());
        zip.outputStream.on("error", (error: Error) => controller.error(error));

        zip.end();
      },
    });

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${box.id}.zip"`,
      },
    });
  } catch {
    return new Response("There was an error!", { status: 400 });
  }
}
