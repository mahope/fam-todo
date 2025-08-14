
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo } from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const isPending = status === "loading";
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
          <p className="text-muted-foreground">Indlæser...</p>
        </div>
      </div>
    );
  }

  if (session?.user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <ListTodo className="h-16 w-16 mx-auto text-primary" />
          <div>
            <CardTitle className="text-3xl font-bold">
              FamTodo
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Familie Opgave Håndtering
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button size="lg" className="w-full" asChild>
            <Link href="/register">
              Opret Konto
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link href="/login">
              Log Ind
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
