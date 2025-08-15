"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { predefinedColors, type ColorOption, isValidHexColor, getContrastTextColor } from "@/lib/color-utils";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value?: string;
  onValueChange: (color: string) => void;
  showCustomColor?: boolean;
  showColorName?: boolean;
  className?: string;
}

export function ColorPicker({
  value,
  onValueChange,
  showCustomColor = true,
  showColorName = true,
  className,
}: ColorPickerProps) {
  const [customColor, setCustomColor] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedColor = predefinedColors.find(color => color.value === value);
  const displayColor = value || predefinedColors[0].value;

  const handleColorSelect = (colorValue: string) => {
    onValueChange(colorValue);
    setIsOpen(false);
  };

  const handleCustomColorSubmit = () => {
    if (isValidHexColor(customColor)) {
      onValueChange(customColor);
      setCustomColor("");
      setIsOpen(false);
    }
  };

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            type="button"
          >
            <div
              className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: displayColor }}
            />
            {showColorName && selectedColor ? selectedColor.name : "Vælg farve"}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Foruddefinerede farver</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color.id}
                    className={cn(
                      "w-10 h-10 rounded-lg border-2 shadow-sm hover:scale-110 transition-transform relative",
                      value === color.value ? "border-foreground" : "border-white"
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorSelect(color.value)}
                    title={color.description}
                  >
                    {value === color.value && (
                      <Check 
                        className="w-4 h-4 absolute inset-0 m-auto"
                        style={{ color: color.textColor }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Show color names for better accessibility */}
            {showColorName && (
              <div className="flex flex-wrap gap-1">
                {predefinedColors.slice(0, 6).map((color) => (
                  <Badge
                    key={color.id}
                    variant={value === color.value ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer text-xs",
                      value === color.value && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => handleColorSelect(color.value)}
                  >
                    {color.name}
                  </Badge>
                ))}
              </div>
            )}

            {showCustomColor && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Brugerdefineret farve</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="#3b82f6"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleCustomColorSubmit}
                    disabled={!isValidHexColor(customColor)}
                  >
                    Brug
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Indtast en hex farvekode (f.eks. #3b82f6)
                </p>
              </div>
            )}

            {/* Current selection preview */}
            {value && (
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: displayColor }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {selectedColor ? selectedColor.name : "Brugerdefineret"}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {displayColor}
                    </div>
                  </div>
                </div>
                
                {/* Preview text */}
                <div 
                  className="mt-3 p-2 rounded text-center text-sm font-medium"
                  style={{ 
                    backgroundColor: displayColor,
                    color: getContrastTextColor(displayColor)
                  }}
                >
                  Sådan vil tekst se ud
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface ColorDisplayProps {
  color: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export function ColorDisplay({ 
  color, 
  name, 
  size = "md", 
  showName = false,
  className 
}: ColorDisplayProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
  };

  const colorOption = predefinedColors.find(c => c.value === color);
  const displayName = name || colorOption?.name;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full border-2 border-white shadow-sm",
          sizeClasses[size]
        )}
        style={{ backgroundColor: color }}
      />
      {showName && displayName && (
        <span className="text-sm text-muted-foreground">{displayName}</span>
      )}
    </div>
  );
}

interface ColorBadgeProps {
  color: string;
  name?: string;
  className?: string;
  onClick?: () => void;
}

export function ColorBadge({ color, name, className, onClick }: ColorBadgeProps) {
  const colorOption = predefinedColors.find(c => c.value === color);
  const displayName = name || colorOption?.name || "Farve";
  const textColor = getContrastTextColor(color);

  return (
    <Badge
      className={cn(
        "cursor-default",
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
      style={{ 
        backgroundColor: color,
        color: textColor,
        borderColor: color
      }}
      onClick={onClick}
    >
      {displayName}
    </Badge>
  );
}