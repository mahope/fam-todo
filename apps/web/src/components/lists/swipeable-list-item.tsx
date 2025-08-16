"use client";

import React, { useState, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Edit,
  Trash2,
  MoreVertical,
  Archive,
  Copy,
  Share2,
  Eye,
  EyeOff,
  Users,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
}

interface SwipeableListItemProps {
  id: string;
  name: string;
  description?: string;
  listType: "TODO" | "SHOPPING";
  visibility: "PRIVATE" | "FAMILY" | "ADULTS";
  color?: string;
  taskCount?: number;
  completedCount?: number;
  updatedAt: string;
  isArchived?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onShare?: (id: string) => void;
  onToggleVisibility?: (id: string, visibility: string) => void;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  className?: string;
}

export function SwipeableListItem({
  id,
  name,
  description,
  listType,
  visibility,
  color,
  taskCount = 0,
  completedCount = 0,
  updatedAt,
  isArchived = false,
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
  onShare,
  onToggleVisibility,
  leftActions,
  rightActions,
  className,
}: SwipeableListItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [actionTriggered, setActionTriggered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const MAX_SWIPE_DISTANCE = 120;
  const ACTION_THRESHOLD = 80;

  // Default actions if not provided
  const defaultLeftActions: SwipeAction[] = [
    ...(onDuplicate ? [{
      id: "duplicate",
      label: "Duplicate",
      icon: Copy,
      color: "bg-blue-500",
      action: () => onDuplicate(id),
    }] : []),
    ...(onShare ? [{
      id: "share",
      label: "Share",
      icon: Share2,
      color: "bg-green-500",
      action: () => onShare(id),
    }] : []),
  ];

  const defaultRightActions: SwipeAction[] = [
    ...(onEdit ? [{
      id: "edit",
      label: "Edit",
      icon: Edit,
      color: "bg-yellow-500",
      action: () => onEdit(id),
    }] : []),
    ...(onArchive ? [{
      id: "archive",
      label: isArchived ? "Unarchive" : "Archive",
      icon: Archive,
      color: "bg-orange-500",
      action: () => onArchive(id),
    }] : []),
    ...(onDelete ? [{
      id: "delete",
      label: "Delete",
      icon: Trash2,
      color: "bg-red-500",
      action: () => onDelete(id),
    }] : []),
  ];

  const finalLeftActions = leftActions || defaultLeftActions;
  const finalRightActions = rightActions || defaultRightActions;

  const resetSwipe = () => {
    setIsAnimating(true);
    setSwipeOffset(0);
    setActionTriggered(null);
    setTimeout(() => setIsAnimating(false), 150);
  };

  const executeAction = (actions: SwipeAction[], direction: "left" | "right") => {
    if (actions.length === 0) return;
    
    const actionIndex = Math.floor(Math.abs(swipeOffset) / (MAX_SWIPE_DISTANCE / actions.length));
    const actionToExecute = actions[Math.min(actionIndex, actions.length - 1)];
    
    if (actionToExecute) {
      setActionTriggered(actionToExecute.id);
      setTimeout(() => {
        actionToExecute.action();
        resetSwipe();
      }, 100);
    }
  };

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      const { deltaX, dir } = eventData;
      
      // Only handle horizontal swipes
      if (dir !== "Left" && dir !== "Right") return;
      
      // Determine available actions for swipe direction
      const availableActions = dir === "Left" ? finalRightActions : finalLeftActions;
      if (availableActions.length === 0) return;
      
      // Calculate new offset with resistance at edges
      let newOffset = deltaX;
      const maxDistance = MAX_SWIPE_DISTANCE;
      
      if (Math.abs(newOffset) > maxDistance) {
        const excess = Math.abs(newOffset) - maxDistance;
        const resistance = Math.min(excess * 0.2, 20);
        newOffset = (newOffset > 0 ? 1 : -1) * (maxDistance + resistance);
      }
      
      setSwipeOffset(newOffset);
      
      // Show action preview when past threshold
      if (Math.abs(newOffset) > ACTION_THRESHOLD) {
        const actionIndex = Math.floor(Math.abs(newOffset) / (maxDistance / availableActions.length));
        const previewAction = availableActions[Math.min(actionIndex, availableActions.length - 1)];
        setActionTriggered(previewAction?.id || null);
      } else {
        setActionTriggered(null);
      }
    },
    onSwipedLeft: () => {
      if (Math.abs(swipeOffset) > ACTION_THRESHOLD) {
        executeAction(finalRightActions, "left");
      } else {
        resetSwipe();
      }
    },
    onSwipedRight: () => {
      if (Math.abs(swipeOffset) > ACTION_THRESHOLD) {
        executeAction(finalLeftActions, "right");
      } else {
        resetSwipe();
      }
    },
    trackMouse: true,
    trackTouch: true,
  });

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "PRIVATE":
        return Lock;
      case "ADULTS":
        return EyeOff;
      case "FAMILY":
        return Users;
      default:
        return Eye;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "PRIVATE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "ADULTS":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "FAMILY":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  const renderActionBackground = (actions: SwipeAction[], direction: "left" | "right") => {
    if (actions.length === 0) return null;
    
    const isVisible = (direction === "left" && swipeOffset < 0) || (direction === "right" && swipeOffset > 0);
    if (!isVisible) return null;
    
    const actionIndex = Math.floor(Math.abs(swipeOffset) / (MAX_SWIPE_DISTANCE / actions.length));
    const currentAction = actions[Math.min(actionIndex, actions.length - 1)];
    
    if (!currentAction) return null;
    
    const Icon = currentAction.icon;
    const intensity = Math.min(Math.abs(swipeOffset) / ACTION_THRESHOLD, 1);
    
    return (
      <div
        className={cn(
          "absolute inset-y-0 flex items-center justify-center transition-all duration-75",
          direction === "left" ? "right-0" : "left-0",
          currentAction.color,
          actionTriggered === currentAction.id && "scale-110"
        )}
        style={{
          width: `${Math.min(Math.abs(swipeOffset), MAX_SWIPE_DISTANCE)}px`,
          opacity: intensity * 0.9 + 0.1,
        }}
      >
        <div className="flex flex-col items-center justify-center text-white min-w-[60px]">
          <Icon className={cn(
            "transition-all duration-75",
            actionTriggered === currentAction.id ? "h-7 w-7" : "h-5 w-5"
          )} />
          <span className="text-xs font-medium mt-1 whitespace-nowrap">
            {currentAction.label}
          </span>
        </div>
      </div>
    );
  };

  const VisibilityIcon = getVisibilityIcon(visibility);

  const { ref: swipeRef, ...swipeHandlers } = handlers;

  return (
    <div
      ref={(el) => {
        containerRef.current = el;
        if (swipeRef) swipeRef(el);
      }}
      className={cn("relative overflow-hidden bg-background", className)}
      {...swipeHandlers}
    >
      {/* Left action background */}
      {renderActionBackground(finalLeftActions, "right")}
      
      {/* Right action background */}
      {renderActionBackground(finalRightActions, "left")}
      
      {/* Main content */}
      <div
        className={cn(
          "relative bg-background transition-transform",
          isAnimating ? "duration-150" : "duration-75",
          "hover:bg-muted/50"
        )}
        style={{
          transform: `translateX(${swipeOffset}px)`,
        }}
      >
        <Link href={`/lists/${id}`} className="block">
          <div className="flex items-center gap-3 p-4">
            {/* List icon and color indicator */}
            <div className="flex-shrink-0">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: color || "#3b82f6" }}
              >
                {listType === "SHOPPING" ? (
                  <ShoppingCart className="h-5 w-5 text-white" />
                ) : (
                  <ListTodo className="h-5 w-5 text-white" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Name and visibility */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn(
                  "font-medium text-base leading-tight truncate",
                  isArchived && "text-muted-foreground"
                )}>
                  {name}
                </h3>
                <Badge className={cn("text-xs flex-shrink-0", getVisibilityColor(visibility))}>
                  <VisibilityIcon className="h-3 w-3 mr-1" />
                  {visibility.toLowerCase()}
                </Badge>
              </div>

              {/* Description */}
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {description}
                </p>
              )}

              {/* Progress and stats */}
              <div className="flex items-center gap-3">
                {taskCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {completedCount}/{taskCount}
                    </span>
                  </div>
                )}
                
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {new Date(updatedAt).toLocaleDateString("da-DK", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Actions menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit list
                  </DropdownMenuItem>
                )}
                
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate list
                  </DropdownMenuItem>
                )}
                
                {onShare && (
                  <DropdownMenuItem onClick={() => onShare(id)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share list
                  </DropdownMenuItem>
                )}
                
                {onToggleVisibility && (
                  <DropdownMenuItem onClick={() => onToggleVisibility(id, visibility)}>
                    <VisibilityIcon className="h-4 w-4 mr-2" />
                    Change visibility
                  </DropdownMenuItem>
                )}
                
                {onArchive && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onArchive(id)}>
                      <Archive className="h-4 w-4 mr-2" />
                      {isArchived ? "Unarchive" : "Archive"} list
                    </DropdownMenuItem>
                  </>
                )}
                
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete list
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Link>
      </div>
    </div>
  );
}