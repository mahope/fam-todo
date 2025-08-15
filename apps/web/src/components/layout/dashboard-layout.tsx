"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { Sidebar } from "@/components/navigation/sidebar";
import { FloatingActionButton } from "@/components/navigation/floating-action-button";
import { QuickTaskDialog } from "@/components/tasks/quick-task-dialog";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const [showQuickTask, setShowQuickTask] = useState(false);

  // Only show navigation for authenticated users
  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main content area */}
        <div className="flex-1 pb-20 md:pb-0">
          {children}
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav onQuickAdd={() => setShowQuickTask(true)} />

      {/* Floating action button for quick task creation */}
      <FloatingActionButton />

      {/* Quick task dialog */}
      <QuickTaskDialog 
        open={showQuickTask}
        onOpenChange={setShowQuickTask}
      />
    </>
  );
}