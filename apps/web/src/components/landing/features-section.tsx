"use client";

import {
  Users,
  ShoppingCart,
  Calendar,
  Lock,
  Wifi,
  Bell,
  Smartphone,
  FolderTree,
  Tag,
  Clock,
  Share2,
  Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Familie Samarbejde",
    description: "Del opgaver og lister med hele familien. Alle kan se og opdatere i realtid.",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/20"
  },
  {
    icon: ShoppingCart,
    title: "Smart Indkøbsliste",
    description: "Automatisk kategorisering af varer og intelligent autocomplete for hurtigere tilføjelse.",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/20"
  },
  {
    icon: Calendar,
    title: "Opgave Kalender",
    description: "Visualiser alle opgaver i en kalendervisning med deadlines og tilbagevendende opgaver.",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/20"
  },
  {
    icon: Lock,
    title: "Private & Delte Lister",
    description: "Opret private lister eller del dem med hele familien eller kun voksne.",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/20"
  },
  {
    icon: Wifi,
    title: "Offline Tilgængelig",
    description: "Arbejd videre selv uden internet. Alle ændringer synkroniseres automatisk.",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/20"
  },
  {
    icon: Bell,
    title: "Push Notifikationer",
    description: "Bliv notificeret om nye opgaver, deadlines og vigtige opdateringer.",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/20"
  },
  {
    icon: Smartphone,
    title: "Mobil-Først Design",
    description: "Optimeret til mobil brug med nem navigation og hurtige handlinger.",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/20"
  },
  {
    icon: FolderTree,
    title: "Mapper & Organisering",
    description: "Organiser dine lister i mapper med farver for bedre overblik.",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
  },
  {
    icon: Tag,
    title: "Tags & Kategorier",
    description: "Tag opgaver og find dem nemt igen med kraftfuld søgning.",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100 dark:bg-pink-900/20"
  },
  {
    icon: Clock,
    title: "Tilbagevendende Opgaver",
    description: "Opsæt daglige, ugentlige eller månedlige gentagne opgaver automatisk.",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/20"
  },
  {
    icon: Share2,
    title: "Aktivitetslog",
    description: "Se hvem der gjorde hvad og hvornår i en detaljeret historik.",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-900/20"
  },
  {
    icon: Zap,
    title: "Hurtig & Responsiv",
    description: "Lynhurtig app bygget med moderne teknologi for den bedste oplevelse.",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/20"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Funktioner
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Alt du behøver for at
            <span className="block text-blue-600 dark:text-blue-400 mt-2">
              organisere familielivet
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            NestList er pakket med funktioner designet specifikt til familier.
            Fra smarte indkøbslister til samarbejdsopgaver - vi har tænkt på alt.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-blue-200 dark:hover:border-blue-800"
            >
              <CardContent className="p-6 space-y-4">
                <div className={`${feature.bgColor} ${feature.color} h-14 w-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            ... og meget mere opdages når du kommer i gang!
          </p>
        </div>
      </div>
    </section>
  );
}
