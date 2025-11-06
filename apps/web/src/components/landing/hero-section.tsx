"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Users,
  Calendar,
  ShoppingCart,
  Sparkles,
  ArrowRight
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white dark:from-blue-950/30 dark:via-background dark:to-background">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />

      <div className="relative container mx-auto px-4 py-20 sm:py-28 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Text content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Prøv gratis i 60 dage - ingen binding
              </span>
            </div>

            {/* Main heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
                Hold din familie
                <span className="block text-blue-600 dark:text-blue-400 mt-2">
                  organiseret og samlet
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                NestList er den perfekte løsning til familier der vil koordinere opgaver,
                indkøbslister og daglige gøremål. Alt på ét sted, tilgængeligt for hele familien.
              </p>
            </div>

            {/* Feature highlights */}
            <ul className="space-y-3 text-left">
              {[
                "Delt opgavestyring for hele familien",
                "Smart indkøbsliste med kategorisering",
                "Synkronisering i realtid på tværs af enheder",
                "Privat og sikkert - kun jeres familie har adgang"
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button
                size="lg"
                className="text-lg px-8 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-600/25"
                asChild
              >
                <Link href="/register">
                  Start 60 dages gratis trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 h-14 border-2"
                asChild
              >
                <Link href="#pricing">
                  Se priser
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 justify-center lg:justify-start pt-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>60 dages gratis trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Ingen kreditkort påkrævet</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Derefter kun 59 kr/md</span>
              </div>
            </div>
          </div>

          {/* Right column - Visual/illustration */}
          <div className="relative">
            {/* Main card mockup */}
            <div className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Jensen Familien</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">4 medlemmer</p>
                </div>
              </div>

              {/* Task examples */}
              <div className="space-y-3">
                {[
                  { icon: ShoppingCart, text: "Indkøb til weekend", color: "bg-green-500" },
                  { icon: Calendar, text: "Børnenes fodboldtræning", color: "bg-blue-500" },
                  { icon: CheckCircle2, text: "Ryd op i garagen", color: "bg-purple-500" }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                  >
                    <div className={`h-10 w-10 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Opgaver</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">8</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Færdige</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Lister</div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 z-20 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg transform rotate-12">
              <span className="text-sm font-bold">60 dage gratis</span>
            </div>
            <div className="absolute -bottom-4 -left-4 z-20 bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg transform -rotate-12">
              <span className="text-sm font-bold">Kun 59 kr/md</span>
            </div>

            {/* Background decoration */}
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30" />
          </div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto text-white dark:text-background"
        >
          <path
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
