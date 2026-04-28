import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { Driver } from "@/models/Driver";
import { createDriverSchema } from "@/schemas/driver";

export async function GET() {
  await dbConnect();
  const drivers = await Driver.find({}).sort({ createdAt: -1 }).lean();
  return jsonOk(drivers);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = createDriverSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());
  const created = await Driver.create(parsed.data);
  return jsonOk(created, { status: 201 });
}

