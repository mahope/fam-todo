"use client";

import React from "react";
import { Loader2, ListTodo, ShoppingCart, Folder, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
  };

  return (
    <Loader2 
      className={cn("animate-spin", sizeClasses[size], className)} 
    />
  );
}

interface PageLoadingProps {
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function PageLoading({ message = "Indlæser...", icon: Icon }: PageLoadingProps) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          {Icon ? (
            <Icon className="h-12 w-12 text-muted-foreground animate-pulse" />
          ) : (
            <LoadingSpinner size="lg" className="text-primary" />
          )}
        </div>
        <div className="text-muted-foreground">{message}</div>
      </div>
    </div>
  );
}

export function TaskListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-5 w-5 mt-1 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ListGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-2 w-full" />
                <div className="flex justify-between text-sm">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ShoppingItemsSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-background rounded-lg border">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-2/3 mb-1" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function FoldersSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="flex-1">
                <Skeleton className="h-5 w-1/2 mb-1" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="w-64 h-screen bg-muted/30 border-r">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div className="p-4 space-y-6">
        {/* Main nav */}
        <div className="space-y-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>

        {/* Recent lists */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 mb-2" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-6 rounded-full ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DataLoadingProps {
  type: "tasks" | "lists" | "shopping" | "folders";
  count?: number;
}

export function DataLoading({ type, count = 5 }: DataLoadingProps) {
  switch (type) {
    case "tasks":
      return <TaskListSkeleton />;
    case "lists":
      return <ListGridSkeleton />;
    case "shopping":
      return <ShoppingItemsSkeleton />;
    case "folders":
      return <FoldersSkeleton />;
    default:
      return (
        <div className="space-y-3">
          {[...Array(count)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
  }
}