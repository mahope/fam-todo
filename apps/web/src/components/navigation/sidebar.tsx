"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  ListTodo, 
  ShoppingCart, 
  Users, 
  Folder,
  Calendar,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Archive,
  Search,
  Bell
} from "lucide-react";

const mainNavItems = [
  {
    href: "/dashboard",
    icon: Home,
    label: "Oversigt",
  },
  {
    href: "/calendar",
    icon: Calendar,
    label: "Kalender",
  },
  {
    href: "/search",
    icon: Search,
    label: "Søg",
  },
];

const resourceNavItems = [
  {
    href: "/lists",
    icon: ListTodo,
    label: "Alle Lister",
  },
  {
    href: "/shopping",
    icon: ShoppingCart,
    label: "Indkøb",
  },
  {
    href: "/folders",
    icon: Folder,
    label: "Mapper",
  },
];

const bottomNavItems = [
  {
    href: "/family",
    icon: Users,
    label: "Familie",
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Indstillinger",
  },
];

type List = {
  id: string;
  name: string;
  listType: 'TODO' | 'SHOPPING';
  visibility: 'PRIVATE' | 'FAMILY' | 'ADULTS';
  _count?: {
    tasks: number;
  };
};

type Folder = {
  id: string;
  name: string;
  color?: string;
  _count: {
    lists: number;
  };
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const api = useApi();
  
  const [foldersExpanded, setFoldersExpanded] = useState(true);
  const [recentListsExpanded, setRecentListsExpanded] = useState(true);

  // Fetch recent lists
  const { data: recentLists = [] } = useQuery({
    queryKey: ["recent-lists"],
    queryFn: async () => {
      const response = await fetch("/api/lists?limit=5&sortBy=updated_at&sortOrder=desc", {
        headers: {
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      // Handle both array and object API responses
      if (Array.isArray(data)) {
        return data as List[];
      }
      // Handle new API format { lists: [], meta: {...} }
      if (data?.lists && Array.isArray(data.lists)) {
        return data.lists as List[];
      }
      return [];
    },
    enabled: api.status === "authenticated" && !!session?.user,
  });

  // Fetch folders
  const { data: folders = [] } = useQuery({
    queryKey: ["sidebar-folders"],
    queryFn: async () => {
      const response = await fetch("/api/folders", {
        headers: {
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      // Handle both array and object API responses
      if (Array.isArray(data)) {
        return data as Folder[];
      }
      // Handle object with folders property
      if (data?.folders && Array.isArray(data.folders)) {
        return data.folders as Folder[];
      }
      return [];
    },
    enabled: api.status === "authenticated" && !!session?.user,
  });

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className={cn("w-64 h-screen bg-muted/30 border-r flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ListTodo className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">NestList</span>
        </Link>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                      active 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Separator />

          {/* Resources */}
          <div>
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ressourcer
            </h3>
            <nav className="space-y-1">
              {resourceNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                      active 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Separator />

          {/* Recent Lists */}
          {recentLists && recentLists.length > 0 && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRecentListsExpanded(!recentListsExpanded)}
                className="w-full justify-between px-3 py-2 h-auto text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Seneste Lister
                {recentListsExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
              
              {recentListsExpanded && (
                <nav className="mt-2 space-y-1">
                  {(recentLists || []).slice(0, 5).map((list) => {
                    const active = pathname === `/lists/${list.id}`;
                    
                    return (
                      <Link
                        key={list.id}
                        href={`/lists/${list.id}`}
                        className={cn(
                          "flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                          active 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {list.listType === 'SHOPPING' ? (
                            <ShoppingCart className="h-3 w-3 flex-shrink-0" />
                          ) : (
                            <ListTodo className="h-3 w-3 flex-shrink-0" />
                          )}
                          <span className="truncate">{list.name}</span>
                        </div>
                        {list._count && list._count.tasks > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {list._count.tasks}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>
          )}

          {/* Folders */}
          {folders && folders.length > 0 && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFoldersExpanded(!foldersExpanded)}
                className="w-full justify-between px-3 py-2 h-auto text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Mapper
                {foldersExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
              
              {foldersExpanded && (
                <nav className="mt-2 space-y-1">
                  {(folders || []).slice(0, 8).map((folder) => {
                    const active = pathname === `/folders/${folder.id}`;
                    
                    return (
                      <Link
                        key={folder.id}
                        href={`/folders/${folder.id}`}
                        className={cn(
                          "flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                          active 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Folder 
                            className="h-3 w-3 flex-shrink-0" 
                            style={{ color: folder.color || undefined }}
                          />
                          <span className="truncate">{folder.name}</span>
                        </div>
                        {folder._count.lists > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {folder._count.lists}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                  
                  {folders.length > 8 && (
                    <Link
                      href="/folders"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <span className="text-xs">Se alle mapper...</span>
                    </Link>
                  )}
                </nav>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hurtige Handlinger
            </h3>
            <div className="space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start px-3" asChild>
                <Link href="/lists/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Ny Liste
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start px-3" asChild>
                <Link href="/folders/new">
                  <Folder className="h-4 w-4 mr-2" />
                  Ny Mappe
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t mt-auto">
        <nav className="space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                  active 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}