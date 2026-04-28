import "dotenv/config";
import mongoose from "mongoose";

import { dbConnect } from "../lib/db";
import { Client } from "../models/Client";
import { Driver } from "../models/Driver";
import { Maintenance } from "../models/Maintenance";
import { PurchaseRequest } from "../models/PurchaseRequest";
import { TransportOrder } from "../models/TransportOrder";
import { Trip } from "../models/Trip";
import { Vehicle } from "../models/Vehicle";
import { VehicleAssignment } from "../models/VehicleAssignment";

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

async function main() {
  const confirm = process.env.SEED_CONFIRM;
  if (confirm !== "YES_SEED_MOCKS") {
    throw new Error('Refusing to seed. Set SEED_CONFIRM="YES_SEED_MOCKS" to proceed.');
  }

  await dbConnect();

  // reset everything except users
  await Promise.all([
    VehicleAssignment.deleteMany({}),
    Trip.deleteMany({}),
    TransportOrder.deleteMany({}),
    Maintenance.deleteMany({}),
    PurchaseRequest.deleteMany({}),
    Vehicle.deleteMany({}),
    Driver.deleteMany({}),
    Client.deleteMany({}),
  ]);

  const now = new Date();
  const cities = ["الرياض", "جدة", "الدمام", "مكة", "المدينة", "القصيم", "تبوك"];
  const cargoTypes = ["مواد غذائية", "أجهزة كهربائية", "أثاث", "مواد بناء", "ملابس", "قطع غيار"];
  const suppliers = ["ورشة النخبة", "مركز الخليج", "محل قطع الغيار", "AutoPro", "شركة الزيوت"];

  // Vehicles (10)
  const vehicles = await Vehicle.insertMany(
    Array.from({ length: 10 }).map((_, i) => {
      const matricule = `SA-${randInt(1000, 9999)}-${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(
        65 + ((i + 3) % 26)
      )}`;
      const brand = pick(["Toyota", "Isuzu", "Mercedes", "Hyundai", "Volvo"]);
      const model = pick(["Dyna", "NPR", "Actros", "HD", "FH"]);
      const status = pick(["available", "on_road", "maintenance", "out_of_service"] as const);
      const isActive = status !== "out_of_service";

      return {
        matricule,
        brand,
        model,
        trim: pick(["Standard", "Premium", "1845", "6x4"]),
        vehicleType: pick(["شاحنة", "وانيت", "مقطورة"]),
        fuelType: "ديزل",
        color: pick(["أبيض", "أسود", "فضي", "أزرق"]),
        year: randInt(2016, 2024),
        odometerKm: randInt(25_000, 380_000),
        status,
        isActive,
        ownerName: "مجموعة الهناء التجارية",
        receiverName: pick(["سالم العتيبي", "محمد القحطاني", "عبدالله الشهري", "فهد الدوسري"]),
        receiverIdNumber: String(randInt(1000000000, 1999999999)),
        receiverMobile: `+9665${randInt(10000000, 99999999)}`,
        licenseType: pick(["نقل خفيف", "نقل ثقيل"]),
        licenseExpiresAt: addDays(now, randInt(30, 720)),
        receivedAt: addDays(now, -randInt(5, 300)),
        insuranceType: pick(["شامل", "ضد الغير"]),
        sectorLocation: `${pick(["القطاع الشرقي", "القطاع الغربي", "القطاع الأوسط"])} — ${pick(cities)}`,
        carMode: pick(["تشغيل", "احتياط", "مؤقت"]),
        documents: [],
      };
    })
  );

  // Drivers (15)
  const drivers = await Driver.insertMany(
    Array.from({ length: 15 }).map(() => {
      const fullName = pick([
        "حمزة بن علي",
        "خالد الشمري",
        "ياسين بن صالح",
        "سفيان بن عمر",
        "ناصر الحربي",
        "مروان الزهراني",
        "حسام القحطاني",
      ]);
      return {
        fullName,
        phone: `+9665${randInt(10000000, 99999999)}`,
        idNumber: String(randInt(1000000000, 2999999999)),
        licenseNumber: `LIC-${randInt(10000, 99999)}`,
        licenseCategory: pick(["C", "C+E", "D"]),
        licenseExpiresAt: addDays(now, randInt(60, 900)),
        notes: "",
      };
    })
  );

  // Assignments history (link ~7 vehicles)
  for (const v of vehicles.slice(0, 7)) {
    const d = pick(drivers);
    const assignedAt = addDays(now, -randInt(1, 120));
    await VehicleAssignment.create({
      vehicleId: v._id,
      driverId: d._id,
      assignedAt,
      notes: "تعيين تلقائي (mocks)",
    });
  }

  // Clients (8)
  const clients = await Client.insertMany(
    Array.from({ length: 8 }).map(() => ({
      name: pick(["شركة السريع", "مؤسسة الندى", "متجر النخبة", "شركة الأمان", "مخازن الشرق", "مؤسسة التوريد"]),
      phone: `+9661${randInt(10000000, 99999999)}`,
      city: pick(cities),
      country: "Saudi Arabia",
      isActive: true,
    }))
  );

  // Orders (40) + Trips (subset)
  const orders = await TransportOrder.insertMany(
    Array.from({ length: 40 }).map((_, idx) => {
      const scheduledAt = addDays(startOfDay(now), -randInt(0, 13));
      scheduledAt.setHours(randInt(7, 20), 0, 0, 0);
      const status = pick(["new", "approved", "on_road", "delivered", "cancelled"] as const);
      const deliveredAt = status === "delivered" ? addDays(scheduledAt, 0) : undefined;
      const approvedAt = status === "approved" || status === "on_road" || status === "delivered" ? addDays(scheduledAt, 0) : undefined;
      const cancelledAt = status === "cancelled" ? addDays(scheduledAt, 0) : undefined;

      const revenue = randInt(1200, 9000);
      const cost = randInt(600, Math.max(700, revenue - 300));

      const vehicle = Math.random() > 0.35 ? pick(vehicles) : null;
      const driver = Math.random() > 0.35 ? pick(drivers) : null;

      const orderNo = `ORD-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}-${String(
        idx + 1
      ).padStart(4, "0")}`;

      return {
        orderNo,
        clientId: pick(clients)._id,
        pickup: {
          label: "نقطة تحميل",
          addressLine: pick(["شارع الملك فهد", "المنطقة الصناعية", "طريق المطار", "حي السلام"]),
          city: pick(cities),
          contactName: pick(["مسؤول المستودع", "الاستقبال"]),
          contactPhone: `+9665${randInt(10000000, 99999999)}`,
        },
        delivery: {
          label: "نقطة تسليم",
          addressLine: pick(["شارع التحلية", "حي النرجس", "طريق الدائري", "ميناء"]),
          city: pick(cities),
          contactName: pick(["المستلم", "المدير"]),
          contactPhone: `+9665${randInt(10000000, 99999999)}`,
        },
        cargoType: pick(cargoTypes),
        weightKg: randInt(200, 24_000),
        volumeM3: randInt(1, 60),
        scheduledAt,
        approvedAt,
        cancelledAt,
        deliveredAt,
        vehicleId: vehicle?._id,
        driverId: driver?._id,
        status,
        revenueDzd: revenue, // legacy field name (UI formats as SAR)
        costDzd: cost,
        notes: "",
      };
    })
  );

  // Create trips for on_road/delivered orders
  const tripsToCreate = orders.filter((o) => o.vehicleId && o.driverId && (o.status === "on_road" || o.status === "delivered"));
  await Trip.insertMany(
    tripsToCreate.slice(0, 18).map((o, idx) => {
      const plannedStartAt = new Date(o.scheduledAt);
      const startedAt = o.status === "on_road" || o.status === "delivered" ? addDays(plannedStartAt, 0) : undefined;
      const completedAt = o.status === "delivered" ? addDays(plannedStartAt, 0) : undefined;
      return {
        tripNo: `TRIP-${String(now.getFullYear()).slice(-2)}-${String(idx + 1).padStart(4, "0")}`,
        orderId: o._id,
        vehicleId: o.vehicleId,
        driverId: o.driverId,
        status: o.status === "delivered" ? "completed" : "in_progress",
        plannedStartAt,
        startedAt,
        completedAt,
        distanceKm: randInt(25, 850),
        events: [
          { at: plannedStartAt, status: "planned", note: "تم التخطيط" },
          startedAt ? { at: startedAt, status: "started", note: "انطلاق" } : null,
          completedAt ? { at: completedAt, status: "completed", note: "تم التسليم" } : null,
        ].filter(Boolean),
      };
    })
  );

  // Maintenance (30)
  await Maintenance.insertMany(
    Array.from({ length: 30 }).map(() => {
      const performedAt = addDays(now, -randInt(1, 180));
      const type = pick(["oil_change", "inspection", "repair", "tires", "brakes", "other"] as const);
      const v = pick(vehicles);
      return {
        vehicleId: v._id,
        type,
        title:
          type === "oil_change"
            ? "تبديل زيت"
            : type === "repair"
              ? "تصليح"
              : type === "inspection"
                ? "فحص دوري"
                : "تقرير ميكانيك",
        performedAt,
        odometerKm: Math.max(0, (v.odometerKm ?? 0) - randInt(0, 10_000)),
        costSar: randInt(150, 2200),
        supplier: pick(suppliers),
        notes: "",
        attachments: [],
      };
    })
  );

  // Purchases (15)
  const purchases = await PurchaseRequest.insertMany(
    Array.from({ length: 15 }).map((_, idx) => {
      const v = Math.random() > 0.4 ? pick(vehicles) : null;
      const items = [
        { name: pick(["زيت محرك", "فلتر", "بطارية", "إطارات", "زيوت ناقل", "سير"]), qty: randInt(1, 8), unitPriceSar: randInt(35, 950), totalSar: 0 },
        { name: pick(["حساس", "بواجي", "فحمات", "مساعدات"]), qty: randInt(1, 6), unitPriceSar: randInt(20, 650), totalSar: 0 },
      ].slice(0, randInt(1, 2));
      const computed = items.map((it) => ({ ...it, totalSar: Math.round(it.qty * it.unitPriceSar * 100) / 100 }));
      const totalSar = computed.reduce((acc, it) => acc + it.totalSar, 0);
      const createdAt = addDays(now, -randInt(1, 60));
      const status = pick(["submitted", "approved", "ordered", "received", "invoiced", "paid"] as const);

      const base: Record<string, unknown> = {
        status,
        title: `طلب مشتريات #${idx + 1}`,
        supplier: pick(suppliers),
        notes: "",
        vehicleId: v?._id,
        items: computed,
        totalSar,
        submittedAt: createdAt,
      };
      if (status === "approved" || status === "ordered" || status === "received" || status === "invoiced" || status === "paid") base.approvedAt = addDays(createdAt, 1);
      if (status === "ordered" || status === "received" || status === "invoiced" || status === "paid") base.orderedAt = addDays(createdAt, 2);
      if (status === "received" || status === "invoiced" || status === "paid") base.receivedAt = addDays(createdAt, 4);
      if (status === "invoiced" || status === "paid") {
        base.invoicedAt = addDays(createdAt, 5);
        base.invoiceNumber = `INV-${randInt(10000, 99999)}`;
      }
      if (status === "paid") {
        base.paidAt = addDays(createdAt, 6);
        base.paymentMethod = pick(["تحويل", "نقد"]);
        base.paymentRef = `PAY-${randInt(100000, 999999)}`;
      }
      return base;
    })
  );

  // eslint-disable-next-line no-console
  console.log("Seed mocks done:", {
    vehicles: vehicles.length,
    drivers: drivers.length,
    clients: clients.length,
    orders: orders.length,
    purchases: purchases.length,
  });
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

