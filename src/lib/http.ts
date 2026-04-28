export function jsonOk<T>(data: T, init?: ResponseInit) {
  return Response.json({ ok: true as const, data }, init);
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return Response.json({ ok: false as const, message, details }, { status });
}

