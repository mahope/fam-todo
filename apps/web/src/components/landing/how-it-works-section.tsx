"use client";

import { UserPlus, Users, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "1",
    icon: UserPlus,
    title: "Opret din familie",
    description: "Tilmeld dig gratis og opret en profil til din familie på under 2 minutter. Ingen kreditkort påkrævet.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    number: "2",
    icon: Users,
    title: "Inviter familiemedlemmer",
    description: "Send invitationer til din partner, børn og andre i husstanden. De kan tilslutte sig med deres egen konto.",
    color: "from-purple-500 to-pink-500"
  },
  {
    number: "3",
    icon: Rocket,
    title: "Kom i gang!",
    description: "Start med at oprette lister, tilføje opgaver og koordinere familiens aktiviteter. Det er så nemt!",
    color: "from-orange-500 to-red-500"
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,white,transparent)] dark:bg-grid-slate-700/25" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 mb-6">
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Sådan kommer du i gang
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            I gang på bare
            <span className="block text-blue-600 dark:text-blue-400 mt-2">
              3 enkle trin
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Det er nemt at komme i gang. Følg disse tre trin og få din familie organiseret i dag.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 -translate-x-1/2">
                    <div className="absolute top-1/2 right-0 -translate-y-1/2">
                      <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                    </div>
                  </div>
                )}

                {/* Step card */}
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 p-8 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group">
                  {/* Number badge */}
                  <div className="absolute -top-4 -left-4 h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg mx-auto lg:mx-0`}>
                    <step.icon className="h-10 w-10 text-white" />
                  </div>

                  {/* Content */}
                  <div className="space-y-3 text-center lg:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center space-y-6">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Klar til at komme i gang?
          </p>
          <Button
            size="lg"
            className="text-lg px-10 h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 shadow-xl shadow-blue-600/25"
            asChild
          >
            <Link href="/register">
              Opret din familie gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Ingen kreditkort påkrævet • Gratis for evigt • Kom i gang på 2 minutter
          </p>
        </div>
      </div>
    </section>
  );
}
