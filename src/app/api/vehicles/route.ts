import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { Vehicle } from "@/models/Vehicle";
import { createVehicleSchema } from "@/schemas/vehicle";

export async function GET() {
  await dbConnect();
  const vehicles = await Vehicle.find({}).sort({ createdAt: -1 }).lean();
  return jsonOk(vehicles);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = createVehicleSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());

  const created = await Vehicle.create(parsed.data);
  return jsonOk(created, { status: 201 });
}

