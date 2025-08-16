"use client";

import React, { useState, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  User,
  Archive,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
}

interface SwipeableTaskItemProps {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  deadline?: string;
  assignee?: {
    id: string;
    displayName: string;
  };
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onChangePriority?: (id: string, priority: string) => void;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  className?: string;
}

export function SwipeableTaskItem({
  id,
  title,
  description,
  completed,
  priority,
  deadline,
  assignee,
  onToggleComplete,
  onEdit,
  onDelete,
  onArchive,
  onChangePriority,
  leftActions,
  rightActions,
  className,
}: SwipeableTaskItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [actionTriggered, setActionTriggered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const MAX_SWIPE_DISTANCE = 120;
  const ACTION_THRESHOLD = 80;

  // Default actions if not provided
  const defaultLeftActions: SwipeAction[] = [
    {
      id: "complete",
      label: completed ? "Mark incomplete" : "Mark complete",
      icon: completed ? XCircle : CheckCircle2,
      color: completed ? "bg-orange-500" : "bg-green-500",
      action: () => onToggleComplete(id, !completed),
    },
  ];

  const defaultRightActions: SwipeAction[] = [
    ...(onEdit ? [{
      id: "edit",
      label: "Edit",
      icon: Edit,
      color: "bg-blue-500",
      action: () => onEdit(id),
    }] : []),
    ...(onArchive ? [{
      id: "archive", 
      label: "Archive",
      icon: Archive,
      color: "bg-yellow-500",
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

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-600 text-white";
      case "HIGH":
        return "bg-red-500 text-white";
      case "MEDIUM":
        return "bg-yellow-500 text-black";
      case "LOW":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getDeadlineColor = (deadline?: string) => {
    if (!deadline) return "text-gray-600";
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadlineOnly = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
    
    if (deadlineOnly < today && !completed) {
      return "text-red-600";
    }
    if (deadlineOnly.getTime() === today.getTime()) {
      return "text-yellow-600";
    }
    return "text-gray-600";
  };

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
        <div className="flex items-start gap-3 p-4">
          {/* Checkbox */}
          <Checkbox
            checked={completed}
            onCheckedChange={(checked) => onToggleComplete(id, !!checked)}
            className="mt-1"
          />

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title and priority */}
            <div className="flex items-center gap-2">
              <h4 className={cn(
                "font-medium text-sm leading-snug",
                completed && "line-through text-muted-foreground"
              )}>
                {title}
              </h4>
              {priority && (
                <Badge className={cn("text-xs", getPriorityColor(priority))}>
                  {priority.toLowerCase()}
                </Badge>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}

            {/* Meta information */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {deadline && (
                <div className={cn("flex items-center gap-1", getDeadlineColor(deadline))}>
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(deadline).toLocaleDateString("da-DK", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              {assignee && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{assignee.displayName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onToggleComplete(id, !completed)}
              >
                {completed ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark incomplete
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark complete
                  </>
                )}
              </DropdownMenuItem>
              
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              
              {onChangePriority && (
                <DropdownMenuItem onClick={() => onChangePriority(id, "HIGH")}>
                  <Flag className="h-4 w-4 mr-2" />
                  Set high priority
                </DropdownMenuItem>
              )}
              
              {onArchive && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onArchive(id)}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
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
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}