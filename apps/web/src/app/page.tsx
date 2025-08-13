
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo, Users, ShoppingCart, Calendar, Smartphone, Shield, Zap } from "lucide-react";

export default function HomePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user && !isPending) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <ListTodo className="h-12 w-12 mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (session?.user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="flex flex-1 items-center justify-center px-4 py-12 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <ListTodo className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
              Family Task Management
              <span className="text-primary"> Made Simple</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Organize your family's tasks, shopping lists, and daily routines with a 
              simple, beautiful app designed for families of all sizes.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" asChild>
              <Link href="/register">
                Get Started Free
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Family-Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create separate lists for adults and children with role-based access control.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <ShoppingCart className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Smart Shopping</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Intelligent shopping lists with auto-categorization and suggestions.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Smartphone className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Mobile First</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Designed for mobile with offline support and real-time sync across devices.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Task Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Set deadlines, recurring tasks, and get reminders for important items.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Private & Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Self-hosted solution with end-to-end encryption. Your data stays private.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-xl">Real-time Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Changes appear instantly across all family members' devices.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 FamTodo. Built with Next.js and Supabase.</p>
        </div>
      </footer>
    </div>
  );
}
