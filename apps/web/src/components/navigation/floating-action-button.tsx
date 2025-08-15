"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, ListTodo, ShoppingCart, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickTaskDialog } from "@/components/tasks/quick-task-dialog";

interface FloatingActionButtonProps {
  className?: string;
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickTask, setShowQuickTask] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleQuickTask = () => {
    setShowQuickTask(true);
    setIsExpanded(false);
  };

  const quickActions = [
    {
      icon: ListTodo,
      label: "Ny Opgave",
      action: handleQuickTask,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      icon: ShoppingCart,
      label: "Indkøbsliste",
      action: () => {
        // Navigate to create shopping list
        window.location.href = "/lists/new?type=SHOPPING";
        setIsExpanded(false);
      },
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      icon: Calendar,
      label: "Kalender",
      action: () => {
        window.location.href = "/calendar";
        setIsExpanded(false);
      },
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <>
      <div className={cn("fixed bottom-20 right-4 z-40 md:bottom-4", className)}>
        {/* Quick action buttons */}
        {isExpanded && (
          <div className="flex flex-col items-end gap-3 mb-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="bg-background border px-3 py-1 rounded-full text-sm shadow-lg">
                    {action.label}
                  </span>
                  <Button
                    size="icon"
                    className={cn("h-12 w-12 rounded-full shadow-lg", action.color)}
                    onClick={action.action}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Main FAB */}
        <Button
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-200",
            isExpanded 
              ? "bg-red-600 hover:bg-red-700 rotate-45" 
              : "bg-primary hover:bg-primary/90"
          )}
          onClick={handleToggle}
        >
          {isExpanded ? (
            <X className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </Button>

        {/* Backdrop */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/20 -z-10"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>

      <QuickTaskDialog 
        open={showQuickTask}
        onOpenChange={setShowQuickTask}
      />
    </>
  );
}