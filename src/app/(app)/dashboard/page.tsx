import { MetricsCards } from "./metrics-cards";
import { DashboardCharts } from "./charts";

export default async function DashboardPage() {
  return (
    <div className="space-y-6">
      <MetricsCards refreshMs={10_000} />
      <DashboardCharts days={14} />
    </div>
  );
}

