"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ListTodo,
  ShoppingCart,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Copy,
  Share2,
  Users,
  Lock,
  EyeOff,
  Calendar,
  Clock,
} from "lucide-react";
import { ColorDisplay, ColorBadge } from "@/components/ui/color-picker";
import { cn } from "@/lib/utils";
import { getContrastTextColor, lightenColor } from "@/lib/color-utils";

interface EnhancedListCardProps {
  id: string;
  name: string;
  description?: string;
  listType: "TODO" | "SHOPPING";
  visibility: "PRIVATE" | "FAMILY" | "ADULTS";
  color?: string;
  taskCount: number;
  completedCount: number;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  recentActivity?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onShare?: (id: string) => void;
  className?: string;
}

export function EnhancedListCard({
  id,
  name,
  description,
  listType,
  visibility,
  color = "#3b82f6",
  taskCount,
  completedCount,
  createdAt,
  updatedAt,
  isArchived = false,
  recentActivity,
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
  onShare,
  className,
}: EnhancedListCardProps) {
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
  const remainingTasks = taskCount - completedCount;
  const textColor = getContrastTextColor(color);
  const lightColor = lightenColor(color, 0.9);

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
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "I dag";
    if (diffInDays === 1) return "I går";
    if (diffInDays < 7) return `${diffInDays} dage siden`;
    
    return date.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short"
    });
  };

  return (
    <Card 
      className={cn(
        "group hover:shadow-md transition-all duration-200 relative overflow-hidden",
        isArchived && "opacity-60",
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
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* List icon with color */}
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ 
                backgroundColor: color,
                color: textColor
              }}
            >
              {listType === "SHOPPING" ? (
                <ShoppingCart className="h-5 w-5" />
              ) : (
                <ListTodo className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link 
                href={`/lists/${id}`}
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
              
              {onShare && (
                <DropdownMenuItem onClick={() => onShare(id)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Del
                </DropdownMenuItem>
              )}
              
              {(onArchive || onDelete) && <DropdownMenuSeparator />}
              
              {onArchive && (
                <DropdownMenuItem onClick={() => onArchive(id)}>
                  <Archive className="h-4 w-4 mr-2" />
                  {isArchived ? "Genskab" : "Arkiver"}
                </DropdownMenuItem>
              )}
              
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Slet
                </DropdownMenuItem>
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
          
          {isArchived && (
            <Badge variant="secondary" className="text-xs">
              <Archive className="h-3 w-3 mr-1" />
              Arkiveret
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="py-3">
        {/* Progress section */}
        {taskCount > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fremgang</span>
              <span className="font-medium">{completedCount}/{taskCount}</span>
            </div>
            
            <Progress 
              value={progress} 
              className="h-2"
              style={{
                // Custom progress color
                background: lightColor,
              }}
            />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progress}% færdig</span>
              {remainingTasks > 0 && (
                <span>{remainingTasks} tilbage</span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {listType === "SHOPPING" ? "Ingen varer endnu" : "Ingen opgaver endnu"}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t bg-muted/20">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Opdateret {formatDate(updatedAt)}</span>
          </div>
          
          {recentActivity && (
            <div className="flex items-center gap-1 max-w-[150px]">
              <Calendar className="h-3 w-3" />
              <span className="truncate">{recentActivity}</span>
            </div>
          )}
          
          {/* Color indicator */}
          <ColorDisplay color={color} size="sm" />
        </div>
      </CardFooter>
    </Card>
  );
}

// Simplified version for smaller spaces
interface CompactListCardProps {
  id: string;
  name: string;
  listType: "TODO" | "SHOPPING";
  color?: string;
  taskCount: number;
  completedCount: number;
  className?: string;
}

export function CompactListCard({
  id,
  name,
  listType,
  color = "#3b82f6",
  taskCount,
  completedCount,
  className,
}: CompactListCardProps) {
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
  
  return (
    <Link href={`/lists/${id}`}>
      <Card className={cn("hover:shadow-md transition-all duration-200 overflow-hidden", className)}>
        {/* Color accent */}
        <div 
          className="h-1 w-full"
          style={{ backgroundColor: color }}
        />
        
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div 
              className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
              style={{ 
                backgroundColor: color,
                color: getContrastTextColor(color)
              }}
            >
              {listType === "SHOPPING" ? (
                <ShoppingCart className="h-4 w-4" />
              ) : (
                <ListTodo className="h-4 w-4" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{name}</h4>
              {taskCount > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-12 bg-gray-200 rounded-full h-1">
                    <div
                      className="h-1 rounded-full transition-all"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {completedCount}/{taskCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}