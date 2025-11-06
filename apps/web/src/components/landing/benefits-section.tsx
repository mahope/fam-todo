"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  HeartHandshake,
  TrendingUp,
  Shield,
  Smile,
  Target,
  Award
} from "lucide-react";

const benefits = [
  {
    icon: HeartHandshake,
    title: "Bedre Familiesamarbejde",
    description: "Ingen flere misforståelser om hvem der skulle købe mælk eller hente børnene. Alt er tydeligt og tilgængeligt for alle.",
    stats: "98% mindre forvirring"
  },
  {
    icon: TrendingUp,
    title: "Øget Produktivitet",
    description: "Få mere gjort som familie ved at koordinere opgaver effektivt. Undgå dobbeltarbejde og glemte opgaver.",
    stats: "3x hurtigere koordinering"
  },
  {
    icon: Shield,
    title: "Privatliv & Sikkerhed",
    description: "Dine familiedata er beskyttet med moderne sikkerhed. Kun medlemmer af din familie har adgang.",
    stats: "100% privat og sikkert"
  },
  {
    icon: Smile,
    title: "Mindre Stress",
    description: "Reducer hverdagsstress ved at have styr på alt på ét sted. Ingen flere sticky notes eller glemte beskeder.",
    stats: "Mindre kaos, mere ro"
  },
  {
    icon: Target,
    title: "Nå Jeres Mål",
    description: "Hold styr på både små daglige opgaver og større familieprojekter. Følg fremskridt og fejr succeser sammen.",
    stats: "Opnå mere sammen"
  },
  {
    icon: Award,
    title: "Byg Gode Vaner",
    description: "Hjælp børnene med at lære ansvar gennem tildelte opgaver. Opbyg struktur og rutiner der virker.",
    stats: "Positive rutiner"
  }
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 sm:py-28 bg-gradient-to-b from-white to-blue-50 dark:from-background dark:to-blue-950/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-6">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Fordele
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Hvorfor vælger familier
            <span className="block text-blue-600 dark:text-blue-400 mt-2">
              NestList?
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Mere end bare en todo-app. NestList hjælper din familie med at blive
            mere organiseret, produktiv og harmonisk.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-2 bg-white dark:bg-gray-900"
            >
              <CardContent className="p-8 space-y-4">
                {/* Icon */}
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Stat badge */}
                  <div className="pt-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {benefit.stats}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom highlight */}
        <div className="mt-20 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-600 border-0 shadow-2xl">
            <CardContent className="p-8 sm:p-12 text-center text-white space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold">
                Slut med rod og kaos
              </h3>
              <p className="text-lg sm:text-xl text-blue-50 max-w-2xl mx-auto">
                Tusindvis af familier bruger allerede NestList til at holde styr på
                hverdagen. Bliv en del af fællesskabet i dag!
              </p>
              <div className="flex flex-wrap gap-6 justify-center pt-4 text-blue-50">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span>Gratis at bruge</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span>Ingen skjulte gebyrer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span>Kom i gang på 2 minutter</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
