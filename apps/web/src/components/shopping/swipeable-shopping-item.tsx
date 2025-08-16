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
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
}

interface SwipeableShoppingItemProps {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  isPurchased: boolean;
  onTogglePurchased: (id: string, purchased: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onIncreaseQuantity?: (id: string) => void;
  onDecreaseQuantity?: (id: string) => void;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  className?: string;
}

export function SwipeableShoppingItem({
  id,
  name,
  quantity,
  unit,
  category,
  isPurchased,
  onTogglePurchased,
  onEdit,
  onDelete,
  onIncreaseQuantity,
  onDecreaseQuantity,
  leftActions,
  rightActions,
  className,
}: SwipeableShoppingItemProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [actionTriggered, setActionTriggered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const MAX_SWIPE_DISTANCE = 120;
  const ACTION_THRESHOLD = 80;

  // Default actions if not provided
  const defaultLeftActions: SwipeAction[] = [
    {
      id: "purchase",
      label: isPurchased ? "Mark needed" : "Mark purchased",
      icon: isPurchased ? XCircle : CheckCircle2,
      color: isPurchased ? "bg-orange-500" : "bg-green-500",
      action: () => onTogglePurchased(id, !isPurchased),
    },
    ...(onIncreaseQuantity && quantity ? [{
      id: "increase",
      label: "Add more",
      icon: Plus,
      color: "bg-blue-500",
      action: () => onIncreaseQuantity(id),
    }] : []),
  ];

  const defaultRightActions: SwipeAction[] = [
    ...(onDecreaseQuantity && quantity && quantity > 1 ? [{
      id: "decrease",
      label: "Less",
      icon: Minus,
      color: "bg-blue-500",
      action: () => onDecreaseQuantity(id),
    }] : []),
    ...(onEdit ? [{
      id: "edit",
      label: "Edit",
      icon: Edit,
      color: "bg-yellow-500",
      action: () => onEdit(id),
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

  const getCategoryColor = (category?: string) => {
    if (!category) return "bg-gray-100 text-gray-800";
    
    // Simple hash-based color assignment
    const colors = [
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800", 
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ];
    
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
      hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
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
        <div className="flex items-center gap-3 p-4">
          {/* Checkbox */}
          <Checkbox
            checked={isPurchased}
            onCheckedChange={(checked) => onTogglePurchased(id, !!checked)}
          />

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Name and quantity */}
            <div className="flex items-center gap-2">
              <h4 className={cn(
                "font-medium text-sm leading-snug",
                isPurchased && "line-through text-muted-foreground"
              )}>
                {name}
              </h4>
              {quantity && quantity > 1 && (
                <Badge variant="secondary" className="text-xs">
                  {quantity}{unit ? ` ${unit}` : ""}
                </Badge>
              )}
            </div>

            {/* Category */}
            {category && (
              <div className="flex items-center">
                <Badge className={cn("text-xs", getCategoryColor(category))}>
                  {category}
                </Badge>
              </div>
            )}
          </div>

          {/* Shopping cart icon for purchased items */}
          {isPurchased && (
            <div className="text-green-600">
              <ShoppingCart className="h-4 w-4" />
            </div>
          )}

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onTogglePurchased(id, !isPurchased)}
              >
                {isPurchased ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Mark as needed
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as purchased
                  </>
                )}
              </DropdownMenuItem>
              
              {onIncreaseQuantity && (
                <DropdownMenuItem onClick={() => onIncreaseQuantity(id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Increase quantity
                </DropdownMenuItem>
              )}
              
              {onDecreaseQuantity && quantity && quantity > 1 && (
                <DropdownMenuItem onClick={() => onDecreaseQuantity(id)}>
                  <Minus className="h-4 w-4 mr-2" />
                  Decrease quantity
                </DropdownMenuItem>
              )}
              
              {onEdit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit(id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit item
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
                    Delete item
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