"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Gift,
  CreditCard,
  Calendar,
  Zap
} from "lucide-react";
import { useState } from "react";

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const monthlyPrice = 59;
  const yearlyPrice = 590; // 10 måneder for 12 måneder
  const yearlySavings = (monthlyPrice * 12) - yearlyPrice;
  const monthlyEquivalent = Math.round(yearlyPrice / 12);

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-gradient-to-b from-white via-blue-50 to-white dark:from-background dark:via-blue-950/20 dark:to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,white,transparent)] dark:bg-grid-slate-700/25" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-6">
            <Gift className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              60 dages gratis prøveperiode
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Simpel, ærlig
            <span className="block text-blue-600 dark:text-blue-400 mt-2">
              prissætning
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Prøv NestList gratis i 60 dage. Ingen kreditkort påkrævet.
            Derefter kun 59 kr/måned - mindre end en kop kaffe om ugen!
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 p-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                billingPeriod === "monthly"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Månedlig
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all relative ${
                billingPeriod === "yearly"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Årlig
              <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold bg-green-500 text-white rounded-full">
                Spar {Math.round((yearlySavings / (monthlyPrice * 12)) * 100)}%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {/* Free Trial Card */}
          <Card className="border-2 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                  <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                    Start her
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Gratis Prøveperiode
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Prøv alle funktioner gratis
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">0</span>
                  <span className="text-gray-600 dark:text-gray-400">kr</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  i 60 dage - ingen binding
                </p>
              </div>

              <Button className="w-full h-12 text-base" asChild>
                <Link href="/register">
                  Start gratis prøveperiode
                </Link>
              </Button>

              <ul className="space-y-3 text-sm">
                {[
                  "Fuld adgang til alle funktioner",
                  "Ubegrænsede familiemedlemmer",
                  "Ubegrænsede lister og opgaver",
                  "Realtids synkronisering",
                  "Offline support",
                  "Intet kreditkort påkrævet"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Monthly/Yearly Card - Most Popular */}
          <Card className="border-2 border-blue-500 dark:border-blue-600 shadow-xl shadow-blue-600/20 scale-105 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold shadow-lg">
              Mest populær
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2 pt-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {billingPeriod === "monthly" ? "Månedlig" : "Årlig"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Efter prøveperioden
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {billingPeriod === "monthly" ? monthlyPrice : monthlyEquivalent}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">kr/md</span>
                </div>
                {billingPeriod === "yearly" && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {yearlyPrice} kr faktureret årligt
                  </p>
                )}
                {billingPeriod === "monthly" && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ingen binding - opsig når som helst
                  </p>
                )}
              </div>

              <Button className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600" asChild>
                <Link href="/register">
                  Kom i gang nu
                </Link>
              </Button>

              <ul className="space-y-3 text-sm">
                {[
                  "Alt fra gratis prøveperiode",
                  "Prioriteret support",
                  "Tidlig adgang til nye funktioner",
                  "Avancerede rapporter",
                  "Data eksport til alle formater",
                  billingPeriod === "yearly" ? `Spar ${yearlySavings} kr årligt` : "Fleksibel månedlig betaling"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Enterprise/Family+ Card */}
          <Card className="border-2 border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    Kommende
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Familie+
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  For større familier
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">?</span>
                  <span className="text-gray-600 dark:text-gray-400">kr/md</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kommer snart
                </p>
              </div>

              <Button variant="outline" className="w-full h-12 text-base" disabled>
                Tilmeld venteliste
              </Button>

              <ul className="space-y-3 text-sm">
                {[
                  "Alt fra standard plan",
                  "Ubegrænsede underkonti",
                  "Avanceret aktivitetslog",
                  "Dedikeret account manager",
                  "Custom integrationer",
                  "SLA garanti"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Value Comparison */}
        <div className="max-w-5xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-8 sm:p-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Hvad får du for 59 kr/måned?
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Sammenlign værdien af NestList med hvad du ellers bruger penge på
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: CreditCard,
                    title: "2 kopper takeaway kaffe",
                    description: "~30 kr × 2",
                    color: "text-amber-600 dark:text-amber-400"
                  },
                  {
                    icon: Calendar,
                    title: "1 times parkering",
                    description: "I København centrum",
                    color: "text-blue-600 dark:text-blue-400"
                  },
                  {
                    icon: Zap,
                    title: "Mindre end Netflix",
                    description: "Til en hel familie",
                    color: "text-red-600 dark:text-red-400"
                  },
                  {
                    icon: CheckCircle2,
                    title: "Ubetydelig investering",
                    description: "For familiens harmoni",
                    color: "text-green-600 dark:text-green-400"
                  }
                ].map((item, index) => (
                  <div key={index} className="text-center space-y-3 p-4 rounded-xl bg-white/50 dark:bg-gray-900/50">
                    <div className={`h-12 w-12 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center mx-auto ${item.color}`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 rounded-xl bg-white dark:bg-gray-900 text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  For prisen af 2 kopper kaffe, får du:
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  En komplet familie-organisator, der sparer dig timer hver uge,
                  reducerer stress, og hjælper hele familien med at samarbejde bedre.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-700 dark:text-green-300">
              60 dages pengene tilbage garanti
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Ikke tilfreds? Få dine penge tilbage - ingen spørgsmål stillet.
            Vi er sikre på at du vil elske NestList!
          </p>
        </div>
      </div>
    </section>
  );
}
