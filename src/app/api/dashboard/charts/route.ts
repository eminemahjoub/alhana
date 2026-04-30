import { dbConnect } from "@/lib/db";
import { jsonOk } from "@/lib/http";
import { TransportOrder } from "@/models/TransportOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DayPoint = {
  day: string; // YYYY-MM-DD
  orders: number;
};

type ByDayAggRow = {
  _id: string;
  orders: number;
};

type ByStatusAggRow = {
  _id: string;
  count: number;
};

export async function GET(req: Request) {
  await dbConnect();

  const url = new URL(req.url);
  const days = Math.max(7, Math.min(90, Number(url.searchParams.get("days") ?? "14")));

  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const [byDayAgg, byStatusAgg] = await Promise.all([
    TransportOrder.aggregate([
      { $match: { scheduledAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$scheduledAt", timezone: "UTC" },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    TransportOrder.aggregate([
      { $match: { scheduledAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const map = new Map<string, Omit<DayPoint, "day">>();
  for (const row of byDayAgg as ByDayAggRow[]) {
    map.set(String(row._id), {
      orders: Number(row.orders ?? 0),
    });
  }

  const series: DayPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const v = map.get(key) ?? { orders: 0 };
    series.push({ day: key, ...v });
  }

  const status = (byStatusAgg as ByStatusAggRow[]).map((x) => ({
    status: String(x._id ?? "unknown"),
    count: Number(x.count ?? 0),
  }));

  return jsonOk({ range: { start: start.toISOString(), end: end.toISOString(), days }, series, status });
}

