"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, X, Minus } from "lucide-react";

const comparisons = [
  {
    feature: "Månedlig pris",
    nestlist: "59 kr",
    todoist: "€6.99 (~52 kr)",
    notion: "€10 (~75 kr)",
    asana: "€10.99 (~82 kr)"
  },
  {
    feature: "Årlig pris (besparelse)",
    nestlist: "590 kr (spar 118 kr)",
    todoist: "€48 (~360 kr)",
    notion: "€96 (~720 kr)",
    asana: "€99 (~742 kr)"
  },
  {
    feature: "Gratis prøveperiode",
    nestlist: "60 dage",
    todoist: "30 dage",
    notion: "Begrænset gratis",
    asana: "30 dage"
  },
  {
    feature: "Familiesamarbejde",
    nestlist: true,
    todoist: false,
    notion: true,
    asana: true
  },
  {
    feature: "Smart indkøbsliste",
    nestlist: true,
    todoist: false,
    notion: false,
    asana: false
  },
  {
    feature: "Offline support",
    nestlist: true,
    todoist: "Delvis",
    notion: "Delvis",
    asana: false
  },
  {
    feature: "Ubegrænsede projekter",
    nestlist: true,
    todoist: true,
    notion: true,
    asana: true
  },
  {
    feature: "Familieroller (Voksen/Barn)",
    nestlist: true,
    todoist: false,
    notion: false,
    asana: false
  },
  {
    feature: "Dansk support",
    nestlist: true,
    todoist: false,
    notion: false,
    asana: false
  },
  {
    feature: "GDPR compliant i Danmark",
    nestlist: true,
    todoist: true,
    notion: "Delvis",
    asana: "Delvis"
  }
];

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto" />
    );
  }

  if (value === "Delvis") {
    return (
      <div className="flex items-center justify-center gap-2">
        <Minus className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
      </div>
    );
  }

  return (
    <span className="text-sm text-gray-900 dark:text-white font-medium">
      {value}
    </span>
  );
}

export function ComparisonSection() {
  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Sammenligning
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Hvorfor vælge
            <span className="block text-blue-600 dark:text-blue-400 mt-2">
              NestList?
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Se hvordan NestList står sig mod andre populære opgave-apps.
            Bedre funktioner, lavere pris - specielt designet til familier.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-6xl mx-auto overflow-x-auto">
          <Card className="border-2">
            <CardContent className="p-0">
              <div className="min-w-[640px]">
                {/* Header Row */}
                <div className="grid grid-cols-5 gap-4 p-4 sm:p-6 border-b-2 bg-gray-50 dark:bg-gray-900/50">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Funktion
                  </div>
                  <div className="text-center space-y-2">
                    <div className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                      NestList
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Vores løsning
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Todoist
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Premium
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Notion
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Plus
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Asana
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Premium
                    </div>
                  </div>
                </div>

                {/* Comparison Rows */}
                {comparisons.map((row, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-5 gap-4 p-4 sm:p-6 border-b ${
                      index % 2 === 0 ? "bg-white dark:bg-background" : "bg-gray-50/50 dark:bg-gray-900/20"
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white flex items-center">
                      {row.feature}
                    </div>
                    <div className="flex items-center justify-center bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2 border border-blue-200 dark:border-blue-800">
                      <ComparisonCell value={row.nestlist} />
                    </div>
                    <div className="flex items-center justify-center">
                      <ComparisonCell value={row.todoist} />
                    </div>
                    <div className="flex items-center justify-center">
                      <ComparisonCell value={row.notion} />
                    </div>
                    <div className="flex items-center justify-center">
                      <ComparisonCell value={row.asana} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Summary */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-600 border-0 shadow-2xl">
            <CardContent className="p-8 sm:p-12 text-center text-white space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold">
                Konklusionen er klar
              </h3>
              <p className="text-lg sm:text-xl text-blue-50 max-w-2xl mx-auto">
                NestList giver dig mere for pengene med funktioner specielt designet til familier,
                længere prøveperiode, og dansk support - til en lavere pris end konkurrenterne.
              </p>
              <div className="flex flex-wrap gap-6 justify-center pt-4 text-blue-50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>60 dages gratis trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Laveste pris</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Flest familie-funktioner</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
