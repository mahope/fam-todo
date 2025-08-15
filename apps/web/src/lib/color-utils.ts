/**
 * Utility functions for handling colors in the FamTodo application
 */

export interface ColorOption {
  id: string;
  name: string;
  value: string;
  textColor: string;
  description?: string;
}

export const predefinedColors: ColorOption[] = [
  {
    id: "blue",
    name: "Blå",
    value: "#3b82f6",
    textColor: "#ffffff",
    description: "Standard blå - god til generelle opgaver",
  },
  {
    id: "red",
    name: "Rød", 
    value: "#ef4444",
    textColor: "#ffffff",
    description: "Rød - vigtige eller hastende ting",
  },
  {
    id: "green",
    name: "Grøn",
    value: "#10b981",
    textColor: "#ffffff", 
    description: "Grøn - sundhed, miljø eller fuldførte projekter",
  },
  {
    id: "yellow",
    name: "Gul",
    value: "#f59e0b",
    textColor: "#000000",
    description: "Gul - påmindelser eller noter",
  },
  {
    id: "purple",
    name: "Lila",
    value: "#8b5cf6",
    textColor: "#ffffff",
    description: "Lila - kreative projekter eller hobby",
  },
  {
    id: "pink",
    name: "Pink",
    value: "#ec4899",
    textColor: "#ffffff",
    description: "Pink - personlige eller sjove opgaver",
  },
  {
    id: "indigo", 
    name: "Indigo",
    value: "#6366f1",
    textColor: "#ffffff",
    description: "Indigo - arbejde eller professionelle opgaver",
  },
  {
    id: "teal",
    name: "Teal",
    value: "#14b8a6",
    textColor: "#ffffff",
    description: "Teal - læring eller uddannelse",
  },
  {
    id: "orange",
    name: "Orange",
    value: "#f97316",
    textColor: "#ffffff",
    description: "Orange - energi og entusiasme",
  },
  {
    id: "gray",
    name: "Grå",
    value: "#6b7280",
    textColor: "#ffffff",
    description: "Grå - neutrale eller arkiverede elementer",
  },
  {
    id: "rose",
    name: "Rose",
    value: "#f43f5e",
    textColor: "#ffffff",
    description: "Rose - kærlighed og relationer",
  },
  {
    id: "cyan",
    name: "Cyan",
    value: "#06b6d4",
    textColor: "#ffffff",
    description: "Cyan - frisk og moderne",
  },
];

export const categoryColors: Record<string, ColorOption> = {
  work: predefinedColors.find(c => c.id === "indigo")!,
  personal: predefinedColors.find(c => c.id === "blue")!,
  health: predefinedColors.find(c => c.id === "green")!,
  shopping: predefinedColors.find(c => c.id === "orange")!,
  urgent: predefinedColors.find(c => c.id === "red")!,
  creative: predefinedColors.find(c => c.id === "purple")!,
  family: predefinedColors.find(c => c.id === "pink")!,
  learning: predefinedColors.find(c => c.id === "teal")!,
  reminders: predefinedColors.find(c => c.id === "yellow")!,
  archived: predefinedColors.find(c => c.id === "gray")!,
};

/**
 * Generate a color based on a string (for consistent color assignment)
 */
export function generateColorFromString(str: string): ColorOption {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % predefinedColors.length;
  return predefinedColors[index];
}

/**
 * Get contrasting text color for a given background color
 */
export function getContrastTextColor(backgroundColor: string): string {
  // Remove # if present
  const hex = backgroundColor.replace("#", "");
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

/**
 * Validate if a color is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Get a lighter shade of a color (for hover states)
 */
export function lightenColor(color: string, amount: number = 0.1): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const lighten = (val: number) => Math.min(255, Math.floor(val + (255 - val) * amount));
  
  const newR = lighten(rgb.r).toString(16).padStart(2, '0');
  const newG = lighten(rgb.g).toString(16).padStart(2, '0');
  const newB = lighten(rgb.b).toString(16).padStart(2, '0');
  
  return `#${newR}${newG}${newB}`;
}

/**
 * Get a darker shade of a color (for active states)
 */
export function darkenColor(color: string, amount: number = 0.1): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const darken = (val: number) => Math.max(0, Math.floor(val * (1 - amount)));
  
  const newR = darken(rgb.r).toString(16).padStart(2, '0');
  const newG = darken(rgb.g).toString(16).padStart(2, '0');
  const newB = darken(rgb.b).toString(16).padStart(2, '0');
  
  return `#${newR}${newG}${newB}`;
}

/**
 * Get the best color option for a given category or context
 */
export function getColorForContext(context: string): ColorOption {
  const lowerContext = context.toLowerCase();
  
  if (lowerContext.includes("work") || lowerContext.includes("job") || lowerContext.includes("career")) {
    return categoryColors.work;
  }
  if (lowerContext.includes("health") || lowerContext.includes("exercise") || lowerContext.includes("medical")) {
    return categoryColors.health;
  }
  if (lowerContext.includes("shop") || lowerContext.includes("buy") || lowerContext.includes("grocery")) {
    return categoryColors.shopping;
  }
  if (lowerContext.includes("urgent") || lowerContext.includes("important") || lowerContext.includes("critical")) {
    return categoryColors.urgent;
  }
  if (lowerContext.includes("creative") || lowerContext.includes("art") || lowerContext.includes("design")) {
    return categoryColors.creative;
  }
  if (lowerContext.includes("family") || lowerContext.includes("kids") || lowerContext.includes("children")) {
    return categoryColors.family;
  }
  if (lowerContext.includes("learn") || lowerContext.includes("study") || lowerContext.includes("education")) {
    return categoryColors.learning;
  }
  
  // Default to generating from string
  return generateColorFromString(context);
}

/**
 * Create CSS custom properties for a color theme
 */
export function createColorCSSProperties(color: ColorOption): Record<string, string> {
  const lightColor = lightenColor(color.value, 0.1);
  const darkColor = darkenColor(color.value, 0.1);
  
  return {
    '--color-primary': color.value,
    '--color-primary-light': lightColor,
    '--color-primary-dark': darkColor,
    '--color-primary-text': color.textColor,
  };
}