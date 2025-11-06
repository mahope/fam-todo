"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 dark:from-blue-700 dark:via-blue-600 dark:to-purple-700 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white,transparent)]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">
              Prøv gratis i 60 dage - ingen risiko
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white">
            Start din gratis trial
            <span className="block mt-2">
              og transform din hverdag
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl sm:text-2xl text-blue-50 max-w-2xl mx-auto">
            Prøv NestList gratis i 60 dage. Ingen binding, ingen kreditkort.
            Derefter kun 59 kr/måned - mindre end en kop kaffe om ugen!
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white pt-4">
            {[
              "60 dages gratis trial",
              "Ingen kreditkort",
              "Kom i gang på 2 min",
              "Derefter kun 59 kr/md"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              className="text-lg px-10 h-16 bg-white hover:bg-gray-100 text-blue-600 shadow-2xl shadow-black/20 hover:scale-105 transition-all duration-300"
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
              className="text-lg px-10 h-16 border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm"
              asChild
            >
              <Link href="#pricing">
                Se priser
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="pt-8 space-y-2">
            <p className="text-blue-100 text-sm">
              Tilslut dig 5,000+ familier der allerede bruger NestList
            </p>
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-5 w-5 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
              <span className="ml-2 text-white font-semibold">5.0 stjerner</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
