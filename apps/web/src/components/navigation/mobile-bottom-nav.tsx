"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  ListTodo, 
  ShoppingCart, 
  Users, 
  Folder,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    href: "/dashboard",
    icon: Home,
    label: "Hjem",
  },
  {
    href: "/lists",
    icon: ListTodo,
    label: "Lister",
  },
  {
    href: "/folders",
    icon: Folder,
    label: "Mapper",
  },
  {
    href: "/shopping",
    icon: ShoppingCart,
    label: "Indkøb",
  },
  {
    href: "/family",
    icon: Users,
    label: "Familie",
  },
];

interface MobileBottomNavProps {
  onQuickAdd?: () => void;
}

export function MobileBottomNav({ onQuickAdd }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-background/95 backdrop-blur border-t">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-2 text-xs transition-colors rounded-lg",
                  active 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-5 w-5 mb-1", active && "text-primary")} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Quick Add Button */}
          {onQuickAdd && (
            <Button
              size="sm"
              className="flex flex-col items-center justify-center min-w-0 px-3 py-2 text-xs h-auto"
              onClick={onQuickAdd}
            >
              <Plus className="h-5 w-5 mb-1" />
              <span>Ny</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Spacer to prevent content from being hidden behind the nav */}
      <div className="h-16" />
    </div>
  );
}