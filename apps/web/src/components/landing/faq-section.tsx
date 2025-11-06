"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
  {
    question: "Er NestList virkelig gratis?",
    answer: "Ja! NestList er 100% gratis at bruge for familier. Der er ingen skjulte gebyrer, ingen betalingsmure, og du behøver ikke et kreditkort for at komme i gang. Vi tror på at familieorganisering skal være tilgængeligt for alle."
  },
  {
    question: "Hvor mange familiemedlemmer kan jeg invitere?",
    answer: "Du kan invitere så mange familiemedlemmer du har brug for! Der er ingen begrænsning på antallet af brugere i din familie. Alle kan oprette deres egen konto og bidrage til familiens opgaver og lister."
  },
  {
    question: "Kan jeg bruge NestList på både telefon og computer?",
    answer: "Absolut! NestList virker på alle enheder - smartphones, tablets og computere. Alt synkroniseres automatisk i realtid, så du altid har adgang til de nyeste opdateringer uanset hvilken enhed du bruger."
  },
  {
    question: "Hvad sker der hvis jeg mister internetforbindelsen?",
    answer: "Ingen problem! NestList fungerer også offline. Du kan fortsætte med at tilføje opgaver, opdatere lister og afkrydse færdige opgaver. Når du får internetforbindelse igen, synkroniseres alt automatisk."
  },
  {
    question: "Er mine familiedata sikre og private?",
    answer: "Ja, sikkerhed og privatliv er vores højeste prioritet. Dine data er krypteret, og kun medlemmer af din familie har adgang til jeres information. Vi sælger aldrig dine data til tredjeparter, og vi følger alle GDPR-retningslinjer."
  },
  {
    question: "Kan jeg have private lister som kun jeg kan se?",
    answer: "Selvfølgelig! Du kan oprette tre typer lister: Private (kun dig), Familie (alle i familien), og Voksne (kun voksne i familien). Dette giver dig fuld kontrol over hvem der ser hvad."
  },
  {
    question: "Hvordan fungerer indkøbslisten?",
    answer: "Vores smarte indkøbsliste har automatisk kategorisering og intelligent autocomplete. Når du tilføjer varer, kategoriseres de automatisk (fx mælk under 'Mejeriprodukter'), og systemet husker dine tidligere indkøb for hurtigere tilføjelse næste gang."
  },
  {
    question: "Kan børn også bruge appen?",
    answer: "Ja! NestList er designet til hele familien, inklusive børn. Forældre kan tildele børn opgaver og give dem deres egne konti. Det er en fantastisk måde at lære børn ansvar og give dem struktur i hverdagen."
  },
  {
    question: "Hvad hvis jeg har brug for hjælp?",
    answer: "Vi er her for at hjælpe! Du kan altid kontakte vores support-team hvis du har spørgsmål eller støder på problemer. Vi har også omfattende hjælpeguider og tutorials i appen."
  },
  {
    question: "Kan jeg prøve NestList før jeg involverer hele familien?",
    answer: "Absolut! Du kan oprette en konto og udforske alle funktioner helt på egen hånd først. Når du er klar, kan du invitere din familie. Der er ingen forpligtelser, og du kan til enhver tid stoppe med at bruge appen."
  }
];

function FAQItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200">
      <CardContent className="p-0">
        <button
          onClick={onToggle}
          className="w-full text-left p-6 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
        >
          <span className="font-semibold text-gray-900 dark:text-white text-lg pr-8">
            {question}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
            {answer}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 mb-6">
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              FAQ
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Ofte stillede
            <span className="block text-blue-600 dark:text-blue-400 mt-2">
              spørgsmål
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Find svar på de mest almindelige spørgsmål om NestList.
            Kan du ikke finde det du leder efter? Kontakt os!
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

        {/* Still have questions */}
        <Card className="max-w-2xl mx-auto mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center mx-auto">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Har du stadig spørgsmål?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Vi er her for at hjælpe! Kontakt vores support-team, så vender vi tilbage hurtigst muligt.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href="mailto:support@nestlist.dk"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold transition-colors"
              >
                Kontakt support
              </a>
              <a
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
              >
                Kom i gang nu
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
