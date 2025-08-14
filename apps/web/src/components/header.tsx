"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { 
  Home, 
  ListTodo, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "@/lib/auth-client";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session, isPending } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = session?.user;
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <ListTodo className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">FamTodo</span>
        </Link>

        {/* Desktop Navigation */}
        {user && (
          <nav className="hidden md:flex flex-1 items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              <Home className="h-4 w-4 inline mr-1" />
              Overblik
            </Link>
            <Link
              href="/lists"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              <ListTodo className="h-4 w-4 inline mr-1" />
              Lister
            </Link>
            <Link
              href="/shopping"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              <ShoppingCart className="h-4 w-4 inline mr-1" />
              Indkøb
            </Link>
            <Link
              href="/family"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              <Users className="h-4 w-4 inline mr-1" />
              Familie
            </Link>
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Skift tema</span>
          </Button>

          {/* User Menu */}
          {user ? (
            <>
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {/* Desktop user dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hidden md:flex">
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Indstillinger
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log ud
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            !isPending && (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log ind</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Tilmeld</Link>
                </Button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col space-y-1 p-4">
            <Link
              href="/dashboard"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="mr-3 h-4 w-4" />
              Overblik
            </Link>
            <Link
              href="/lists"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ListTodo className="mr-3 h-4 w-4" />
              Lister
            </Link>
            <Link
              href="/shopping"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart className="mr-3 h-4 w-4" />
              Indkøb
            </Link>
            <Link
              href="/family"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Users className="mr-3 h-4 w-4" />
              Familie
            </Link>
            <div className="my-2 h-px bg-border" />
            <Link
              href="/profile"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="mr-3 h-4 w-4" />
              Profil
            </Link>
            <Link
              href="/settings"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="mr-3 h-4 w-4" />
              Indstillinger
            </Link>
            <button
              onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent text-destructive"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Log ud
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}