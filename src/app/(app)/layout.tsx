import type { ReactNode } from "react";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { QuickActionsBar } from "@/components/quick-actions/quick-actions-bar";

export const runtime = "nodejs";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-background luxury-bg">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
      <QuickActionsBar />
    </div>
  );
}

