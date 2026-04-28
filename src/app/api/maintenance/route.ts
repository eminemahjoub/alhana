import { dbConnect } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { Maintenance } from "@/models/Maintenance";
import { Vehicle } from "@/models/Vehicle";
import { createMaintenanceSchema } from "@/schemas/maintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId") ?? undefined;
  const type = searchParams.get("type") ?? undefined;

  const query: Record<string, unknown> = {};
  if (vehicleId) query.vehicleId = vehicleId;
  if (type) query.type = type;

  // ensure model registered for populate
  void Vehicle;

  const rows = await Maintenance.find(query)
    .sort({ performedAt: -1 })
    .limit(200)
    .populate("vehicleId", "matricule brand model status")
    .lean();

  return jsonOk(rows);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = createMaintenanceSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid payload", 422, parsed.error.flatten());

  const created = await Maintenance.create(parsed.data);
  return jsonOk(created, { status: 201 });
}

