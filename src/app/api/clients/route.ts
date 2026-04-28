import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { Client } from "@/models/Client";
import { createClientSchema } from "@/schemas/client";

export async function GET() {
  await dbConnect();
  const clients = await Client.find({}).sort({ createdAt: -1 }).lean();
  return jsonOk(clients);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());
  const created = await Client.create(parsed.data);
  return jsonOk(created, { status: 201 });
}

