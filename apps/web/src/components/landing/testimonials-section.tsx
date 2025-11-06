"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Maria og Henrik Nielsen",
    role: "Forældre til 3 børn",
    avatar: "MH",
    rating: 5,
    text: "NestList har fuldstændig forvandlet vores familieliv! Nu glemmer vi aldrig indkøb, og børnene kan selv se deres opgaver. Det har gjort hverdagen så meget nemmere.",
    highlight: "Fantastisk app!"
  },
  {
    name: "Thomas Jensen",
    role: "Far til 2 teenagere",
    avatar: "TJ",
    rating: 5,
    text: "Som single far havde jeg svært ved at holde styr på alt. NestList holder os organiserede, og børnene elsker at kunne afkrydse deres egne opgaver. Perfekt til vores familie!",
    highlight: "Livreddende værktøj"
  },
  {
    name: "Sarah og Jakob Petersen",
    role: "Nybagte forældre",
    avatar: "SJ",
    rating: 5,
    text: "Med en lille baby har vi brug for alt det hjælp vi kan få! NestList gør det nemt at koordinere hvem der gør hvad, selv når vi er trætte. Anbefaler det varmt!",
    highlight: "Så nemt at bruge"
  },
  {
    name: "Line Mortensen",
    role: "Mor til 4 børn",
    avatar: "LM",
    rating: 5,
    text: "Med 4 børn i forskellige aldre er koordinering kritisk. NestList's mulighed for private og delte lister er genial. Kan ikke forestille mig hverdagen uden det nu!",
    highlight: "Uundværlig app"
  },
  {
    name: "Michael og Emma Sørensen",
    role: "Travl familie",
    avatar: "ME",
    rating: 5,
    text: "Vi prøvede mange apps før NestList. Denne er den eneste der virkelig er lavet til familier. Indkøbslisten alene er guld værd - ingen flere dobbelte indkøb!",
    highlight: "Bedste familie-app"
  },
  {
    name: "Anne Larsen",
    role: "Alenemor til 2",
    avatar: "AL",
    rating: 5,
    text: "Som alenemor skal jeg have styr på alt selv. NestList hjælper mig med at prioritere og huske alt. Børnene synes det er sjovt at hjælpe til når de kan se opgaverne!",
    highlight: "Super hjælpsom"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 mb-6">
            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              Anmeldelser
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Hvad siger andre
            <span className="block text-blue-600 dark:text-blue-400 mt-2">
              familier?
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Tusindvis af familier i Danmark bruger NestList hver dag.
            Her er hvad nogle af dem siger.
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              5,000+
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Aktive familier
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Gennemsnitlig vurdering
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              98%
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Vil anbefale videre
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-gray-900"
            >
              <CardContent className="p-6 space-y-4">
                {/* Quote icon */}
                <div className="flex justify-between items-start">
                  <Quote className="h-8 w-8 text-blue-200 dark:text-blue-900" />
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                {/* Highlight */}
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  "{testimonial.highlight}"
                </div>

                {/* Text */}
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {testimonial.text}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Avatar className="h-12 w-12 border-2 border-blue-200 dark:border-blue-800">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-500">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Dansk udviklet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>GDPR compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Dine data er sikre</span>
          </div>
        </div>
      </div>
    </section>
  );
}
