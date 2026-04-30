import { jsonError } from "@/lib/http";

export async function GET(_: Request) {
  return jsonError("Orders disabled for now", 410);
}

export async function POST(_: Request) {
  return jsonError("Orders disabled for now", 410);
}

