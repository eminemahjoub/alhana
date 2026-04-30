import { MetricsCards } from "./metrics-cards";

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <MetricsCards refreshMs={10_000} />
    </div>
  );
}

