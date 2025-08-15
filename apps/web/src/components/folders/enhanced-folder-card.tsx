"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Folder,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Plus,
  ListTodo,
  ShoppingCart,
  Users,
  Lock,
  EyeOff,
  Calendar,
} from "lucide-react";
import { ColorDisplay } from "@/components/ui/color-picker";
import { cn } from "@/lib/utils";
import { getContrastTextColor, lightenColor } from "@/lib/color-utils";

interface List {
  id: string;
  name: string;
  listType: "TODO" | "SHOPPING";
  taskCount: number;
  completedCount: number;
}

interface EnhancedFolderCardProps {
  id: string;
  name: string;
  description?: string;
  color?: string;
  visibility: "PRIVATE" | "FAMILY" | "ADULTS";
  lists: List[];
  createdAt: string;
  updatedAt: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onAddList?: (folderId: string) => void;
  className?: string;
}

export function EnhancedFolderCard({
  id,
  name,
  description,
  color = "#3b82f6",
  visibility,
  lists,
  createdAt,
  updatedAt,
  onEdit,
  onDelete,
  onDuplicate,
  onAddList,
  className,
}: EnhancedFolderCardProps) {
  const textColor = getContrastTextColor(color);
  const lightColor = lightenColor(color, 0.9);
  
  const totalTasks = lists.reduce((sum, list) => sum + list.taskCount, 0);
  const completedTasks = lists.reduce((sum, list) => sum + list.completedCount, 0);
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const todoLists = lists.filter(list => list.listType === "TODO");
  const shoppingLists = lists.filter(list => list.listType === "SHOPPING");

  const getVisibilityIcon = () => {
    switch (visibility) {
      case "PRIVATE":
        return <Lock className="h-3 w-3" />;
      case "ADULTS":
        return <EyeOff className="h-3 w-3" />;
      case "FAMILY":
        return <Users className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getVisibilityLabel = () => {
    switch (visibility) {
      case "PRIVATE":
        return "Privat";
      case "ADULTS":
        return "Voksne";
      case "FAMILY":
        return "Familie";
      default:
        return "";
    }
  };

  const getVisibilityColor = () => {
    switch (visibility) {
      case "PRIVATE":
        return "text-red-600 bg-red-50 border-red-200";
      case "ADULTS":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "FAMILY":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short"
    });
  };

  return (
    <Card 
      className={cn(
        "group hover:shadow-md transition-all duration-200 relative overflow-hidden",
        className
      )}
    >
      {/* Color accent bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: color }}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Folder icon with color */}
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ 
                backgroundColor: color,
                color: textColor
              }}
            >
              <Folder className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <Link 
                href={`/folders/${id}`}
                className="block group-hover:text-primary transition-colors"
              >
                <h3 className="font-semibold text-lg leading-tight truncate">
                  {name}
                </h3>
              </Link>
              
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onAddList && (
                <>
                  <DropdownMenuItem onClick={() => onAddList(id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tilføj liste
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Rediger
                </DropdownMenuItem>
              )}
              
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Kopier
                </DropdownMenuItem>
              )}
              
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Slet
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className={cn("text-xs", getVisibilityColor())}>
            {getVisibilityIcon()}
            <span className="ml-1">{getVisibilityLabel()}</span>
          </Badge>
          
          <Badge variant="secondary" className="text-xs">
            {lists.length} {lists.length === 1 ? "liste" : "lister"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="py-3">
        {/* Lists overview */}
        {lists.length > 0 ? (
          <div className="space-y-4">
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-lg" style={{ backgroundColor: lightColor }}>
                <div className="text-lg font-bold" style={{ color }}>
                  {todoLists.length}
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <ListTodo className="h-3 w-3" />
                  Opgaver
                </div>
              </div>
              
              <div className="p-3 rounded-lg" style={{ backgroundColor: lightColor }}>
                <div className="text-lg font-bold" style={{ color }}>
                  {shoppingLists.length}
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  Indkøb
                </div>
              </div>
            </div>

            {/* Overall progress */}
            {totalTasks > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Samlet fremgang</span>
                  <span className="font-medium">{completedTasks}/{totalTasks}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
                
                <div className="text-xs text-muted-foreground text-center">
                  {progress}% færdig
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Tom mappe</p>
            <p className="text-xs">Tilføj lister for at komme i gang</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t bg-muted/20">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Opdateret {formatDate(updatedAt)}</span>
          </div>
          
          {/* Color indicator */}
          <ColorDisplay color={color} size="sm" />
        </div>
      </CardFooter>
    </Card>
  );
}

// Compact version for sidebar or smaller spaces
interface CompactFolderCardProps {
  id: string;
  name: string;
  color?: string;
  listCount: number;
  className?: string;
}

export function CompactFolderCard({
  id,
  name,
  color = "#3b82f6",
  listCount,
  className,
}: CompactFolderCardProps) {
  return (
    <Link href={`/folders/${id}`}>
      <Card className={cn("hover:shadow-sm transition-all duration-200 overflow-hidden", className)}>
        {/* Color accent */}
        <div 
          className="h-1 w-full"
          style={{ backgroundColor: color }}
        />
        
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {/* Icon */}
            <div 
              className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
              style={{ 
                backgroundColor: color,
                color: getContrastTextColor(color)
              }}
            >
              <Folder className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate text-sm">{name}</h4>
            </div>

            {/* Count */}
            <Badge variant="secondary" className="text-xs">
              {listCount}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}