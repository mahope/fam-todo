import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "animate-in": {
          from: {
            opacity: "0",
            transform: "translateY(4px) scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
        "animate-out": {
          from: {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
          to: {
            opacity: "0",
            transform: "translateY(4px) scale(0.95)",
          },
        },
        "slide-in-from-bottom-2": {
          from: {
            transform: "translateY(8px)",
          },
          to: {
            transform: "translateY(0)",
          },
        },
        "slide-in-from-top-2": {
          from: {
            transform: "translateY(-8px)",
          },
          to: {
            transform: "translateY(0)",
          },
        },
        "slide-in-from-left-2": {
          from: {
            transform: "translateX(-8px)",
          },
          to: {
            transform: "translateX(0)",
          },
        },
        "slide-in-from-right-2": {
          from: {
            transform: "translateX(8px)",
          },
          to: {
            transform: "translateX(0)",
          },
        },
        "slide-out-to-left-1": {
          from: {
            transform: "translateX(0)",
          },
          to: {
            transform: "translateX(-4px)",
          },
        },
        "slide-out-to-left-2": {
          from: {
            transform: "translateX(0)",
          },
          to: {
            transform: "translateX(-8px)",
          },
        },
        "slide-out-to-right-1": {
          from: {
            transform: "translateX(0)",
          },
          to: {
            transform: "translateX(4px)",
          },
        },
        "slide-out-to-right-2": {
          from: {
            transform: "translateX(0)",
          },
          to: {
            transform: "translateX(8px)",
          },
        },
        "slide-out-to-top-1": {
          from: {
            transform: "translateY(0)",
          },
          to: {
            transform: "translateY(-4px)",
          },
        },
        "slide-out-to-top-2": {
          from: {
            transform: "translateY(0)",
          },
          to: {
            transform: "translateY(-8px)",
          },
        },
        "slide-out-to-bottom-1": {
          from: {
            transform: "translateY(0)",
          },
          to: {
            transform: "translateY(4px)",
          },
        },
        "slide-out-to-bottom-2": {
          from: {
            transform: "translateY(0)",
          },
          to: {
            transform: "translateY(8px)",
          },
        },
        "fade-in-0": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out-0": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "zoom-in-95": {
          from: { transform: "scale(0.95)" },
          to: { transform: "scale(1)" },
        },
        "zoom-out-95": {
          from: { transform: "scale(1)" },
          to: { transform: "scale(0.95)" },
        },
        "slide-in-from-left-1/2": {
          from: {
            transform: "translateX(-50%)",
          },
          to: {
            transform: "translateX(0)",
          },
        },
        "slide-out-to-left-1/2": {
          from: {
            transform: "translateX(0)",
          },
          to: {
            transform: "translateX(-50%)",
          },
        },
        "slide-in-from-top-48": {
          from: {
            transform: "translateY(-48%)",
          },
          to: {
            transform: "translateY(0)",
          },
        },
        "slide-out-to-top-48": {
          from: {
            transform: "translateY(0)",
          },
          to: {
            transform: "translateY(-48%)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "animate-in": "animate-in 0.15s ease-out",
        "animate-out": "animate-out 0.15s ease-in",
        "slide-in-from-bottom-2": "slide-in-from-bottom-2 0.2s ease-out",
        "slide-in-from-top-2": "slide-in-from-top-2 0.2s ease-out",
        "slide-in-from-left-2": "slide-in-from-left-2 0.2s ease-out",
        "slide-in-from-right-2": "slide-in-from-right-2 0.2s ease-out",
        "slide-out-to-left-1": "slide-out-to-left-1 0.15s ease-in",
        "slide-out-to-left-2": "slide-out-to-left-2 0.2s ease-in",
        "slide-out-to-right-1": "slide-out-to-right-1 0.15s ease-in",
        "slide-out-to-right-2": "slide-out-to-right-2 0.2s ease-in",
        "slide-out-to-top-1": "slide-out-to-top-1 0.15s ease-in",
        "slide-out-to-top-2": "slide-out-to-top-2 0.2s ease-in",
        "slide-out-to-bottom-1": "slide-out-to-bottom-1 0.15s ease-in",
        "slide-out-to-bottom-2": "slide-out-to-bottom-2 0.2s ease-in",
        "fade-in-0": "fade-in-0 0.15s ease-out",
        "fade-out-0": "fade-out-0 0.15s ease-in",
        "zoom-in-95": "zoom-in-95 0.15s ease-out",
        "zoom-out-95": "zoom-out-95 0.15s ease-in",
        "slide-in-from-left-1/2": "slide-in-from-left-1/2 0.15s ease-out",
        "slide-out-to-left-1/2": "slide-out-to-left-1/2 0.15s ease-in",
        "slide-in-from-top-48": "slide-in-from-top-48 0.15s ease-out",
        "slide-out-to-top-48": "slide-out-to-top-48 0.15s ease-in",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;