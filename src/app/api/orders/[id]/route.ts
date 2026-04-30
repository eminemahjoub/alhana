import { jsonError } from "@/lib/http";

export async function GET(_: Request, __: { params: Promise<{ id: string }> }) {
  return jsonError("Orders disabled for now", 410);
}

export async function PATCH(_: Request, __: { params: Promise<{ id: string }> }) {
  return jsonError("Orders disabled for now", 410);
}

export async function DELETE(_: Request, __: { params: Promise<{ id: string }> }) {
  return jsonError("Orders disabled for now", 410);
}

