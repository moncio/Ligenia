
import React from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { SidebarInset } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 w-full">
      <DashboardSidebar />
      <SidebarInset className="flex-1 flex flex-col w-full overflow-x-hidden">
        <DashboardHeader />
        <main className="flex-1 w-full">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
};
