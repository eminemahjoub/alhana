import "dotenv/config";
import mongoose from "mongoose";
import { dbConnect } from "../lib/db";

import { Client } from "../models/Client";
import { Driver } from "../models/Driver";
import { Maintenance } from "../models/Maintenance";
import { TransportOrder } from "../models/TransportOrder";
import { Trip } from "../models/Trip";
import { Vehicle } from "../models/Vehicle";

async function main() {
  const confirm = process.env.PURGE_CONFIRM;
  if (confirm !== "YES_DELETE_MOCKS") {
    throw new Error(
      'Refusing to purge DB. Set PURGE_CONFIRM="YES_DELETE_MOCKS" to proceed.'
    );
  }

  await dbConnect();

  const results = await Promise.all([
    Vehicle.deleteMany({}),
    Driver.deleteMany({}),
    Client.deleteMany({}),
    TransportOrder.deleteMany({}),
    Trip.deleteMany({}),
    Maintenance.deleteMany({}),
  ]);

  // eslint-disable-next-line no-console
  console.log("Purge done:", results.map((r) => r.deletedCount));
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

