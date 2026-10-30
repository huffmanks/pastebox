"use server";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { eq, inArray } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";

import { db } from "@/db";
import { boxes, files } from "@/db/schema";
import { EXPIRY_TIME, UPLOADS_DIR } from "@/lib/constants";
import { getFormString } from "@/lib/utils";

export async function createBox(formData: FormData) {
  try {
    try {
      await fs.access(UPLOADS_DIR);
    } catch (_error) {
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
    }

    const now = Date.now();
    const expiresAt = new Date(now + EXPIRY_TIME);

    const slug = getFormString("slug", formData);

    if (!slug || typeof slug !== "string") throw new Error("Missing slug.");

    const existing = await db.select().from(boxes).where(eq(boxes.slug, slug)).limit(1);

    if (existing.length > 0) throw new Error("Slug already exists.");

    const content = getFormString("content", formData);
    const password = getFormString("password", formData);
    const isProtected = Boolean(formData.get("isProtected"));
    const uploadedFiles = formData.getAll("files").filter((f): f is File => f instanceof File);

    if (!content && uploadedFiles.length === 0)
      throw new Error("Must provide a note or at least one file.");

    const [createdBox] = await db
      .insert(boxes)
      .values({
        slug,
        content,
        password: isProtected && password ? hashPassword(password) : null,
        isProtected,
        expiresAt,
      })
      .returning({ id: boxes.id, slug: boxes.slug, expiresAt: boxes.expiresAt });

    if (!createdBox) throw new Error("Failed to create box.");

    const boxId = createdBox.id;

    if (uploadedFiles.length > 0) {
      await Promise.all(
        uploadedFiles.map(async (file: File) => {
          const name = `${boxId}_${file.name}`;
          const uploadPath = path.join(UPLOADS_DIR, name);
          const buffer = Buffer.from(await file.arrayBuffer());

          await fs.writeFile(uploadPath, buffer);

          await db.insert(files).values({
            boxId,
            path: `/uploads/${name}`,
            type: file.type || "application/octet-stream",
            size: file.size,
            name,
            originalName: file.name,
          });
        })
      );
    }

    return createdBox;
  } catch (_error) {
    console.error("Creating the box failed.");
  }
}

export async function updateBoxExpiresAt(boxId: string, ms: number) {
  try {
    const expiresAt = new Date(Date.now() + (ms / 1000) * 1000);

    await db.update(boxes).set({ expiresAt }).where(eq(boxes.id, boxId));
  } catch (_error) {
    console.error("Error updating box expiresAt.");
  }
}

export async function validatePassword(boxId: string, boxPassword: string) {
  try {
    const [box] = await db.select().from(boxes).where(eq(boxes.id, boxId));

    if (!box || !box.password) throw new Error("Invalid password.");

    const ok = verifyPassword(boxPassword, box.password);

    if (!ok) throw new Error("Invalid password.");

    return true;
  } catch (_error) {
    console.warn("Invalid password.");
  }
}

export async function deleteBox(boxId: string) {
  try {
    await db.transaction(async (tx) => {
      const found = await tx.query.boxes.findFirst({
        where: eq(boxes.id, boxId),
        with: { files: true },
      });

      if (!found) throw new Error("Box doesn't exist.");

      if (found.files.length > 0) {
        await Promise.all(
          found.files.map(async (f) => {
            const filePath = path.resolve(UPLOADS_DIR, f.name);

            if (filePath.startsWith(UPLOADS_DIR)) {
              await fs.unlink(filePath).catch(() => {});
            }
          })
        );

        await tx.delete(files).where(
          inArray(
            files.id,
            found.files.map((f) => f.id)
          )
        );
      }

      await tx.delete(boxes).where(eq(boxes.id, boxId));
    });
  } catch (_error) {
    console.error("Deleting box failed.");
  }
}

function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const hash = Buffer.from(hashHex, "hex");
  const newHash = scryptSync(password, salt, hash.length);
  return timingSafeEqual(hash, newHash);
}
