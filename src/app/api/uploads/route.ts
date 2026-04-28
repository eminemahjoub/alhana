import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { jsonError, jsonOk } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

function safeExt(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "application/pdf") return "pdf";
  return null;
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return jsonError("Invalid form data", 400);

  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("Missing file", 400);

  if (!ALLOWED.has(file.type)) return jsonError("Unsupported file type", 415);
  if (file.size > MAX_BYTES) return jsonError("File too large (max 10MB)", 413);

  const ext = safeExt(file.type);
  if (!ext) return jsonError("Unsupported file type", 415);

  const buf = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.${ext}`;

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buf);

  return jsonOk({ url: `/uploads/${filename}` }, { status: 201 });
}

