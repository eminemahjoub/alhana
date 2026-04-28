import mongoose from "mongoose";

type GlobalMongoose = typeof globalThis & {
  _mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

const g = globalThis as GlobalMongoose;

export async function dbConnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI in environment.");
  }

  if (!g._mongoose) g._mongoose = { conn: null, promise: null };
  if (g._mongoose.conn) return g._mongoose.conn;

  if (!g._mongoose.promise) {
    g._mongoose.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DBNAME || undefined,
      })
      .then((m) => m);
  }

  g._mongoose.conn = await g._mongoose.promise;
  return g._mongoose.conn;
}

