import { ReportsPrintClient } from "./print-view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ReportsPrintPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await Promise.resolve(searchParams);
  const start = typeof sp.start === "string" ? sp.start : "";
  const end = typeof sp.end === "string" ? sp.end : "";
  return <ReportsPrintClient start={start} end={end} />;
}

