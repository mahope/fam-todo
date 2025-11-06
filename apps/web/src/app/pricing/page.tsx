"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PricingSection } from "@/components/landing/pricing-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import {
  CheckCircle2,
  ArrowLeft,
  HelpCircle,
  Shield,
  CreditCard,
  Zap
} from "lucide-react";

export default function PricingPage() {
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Indlæser...</p>
        </div>
      </div>
    );
  }

  if (session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/30 dark:to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Tilbage til forsiden
            </Link>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Simpel, transparent
              <span className="block text-blue-600 dark:text-blue-400 mt-2">
                prissætning
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Prøv NestList gratis i 60 dage. Ingen kreditkort, ingen skjulte gebyrer.
              Kun ærlig prissætning for familier der vil have styr på hverdagen.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 pt-4">
              {[
                { icon: Shield, text: "60 dages pengene tilbage garanti" },
                { icon: CreditCard, text: "Ingen kreditkort påkrævet" },
                { icon: Zap, text: "Opsig når som helst" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <item.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Pricing Section */}
      <PricingSection />

      {/* Comparison Section */}
      <ComparisonSection />

      {/* FAQ Section Specific to Pricing */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-4">
                <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Pris FAQ
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Ofte stillede spørgsmål om priser
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Hvornår bliver jeg opkrævet efter trial perioden?",
                  a: "Du bliver først opkrævet efter 60 dage, hvis du vælger at fortsætte. Vi sender dig en påmindelse 7 dage før trial perioden slutter, så du kan beslutte om du vil fortsætte eller opsige."
                },
                {
                  q: "Kan jeg skifte mellem månedlig og årlig betaling?",
                  a: "Ja, du kan når som helst opgradere fra månedlig til årlig betaling og få rabatten. Hvis du skifter fra årlig til månedlig, vil ændringen træde i kraft ved næste fornyelse."
                },
                {
                  q: "Hvad sker der hvis jeg opsiger mit abonnement?",
                  a: "Du kan fortsætte med at bruge NestList indtil slutningen af din betalingsperiode. Dine data bliver gemt i 90 dage, så du kan genaktivere dit abonnement hvis du ombestemmer dig. Efter 90 dage bliver dine data slettet permanent."
                },
                {
                  q: "Er der rabat for flere familier eller non-profit?",
                  a: "Kontakt os på support@nestlist.dk hvis du repræsenterer en non-profit organisation eller har brug for flere familiekonti. Vi tilbyder specialpriser for særlige tilfælde."
                },
                {
                  q: "Hvilke betalingsmetoder accepterer I?",
                  a: "Vi accepterer alle større betalingskort (Visa, Mastercard, American Express), MobilePay, og andre danske betalingsmetoder. Alle betalinger er sikrede og krypterede."
                },
                {
                  q: "Kan jeg få en faktura for min betaling?",
                  a: "Ja, du modtager automatisk en faktura på email hver gang du bliver opkrævet. Du kan også downloade alle dine fakturaer fra indstillinger i appen."
                }
              ].map((item, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      {item.q}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.a}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Klar til at komme i gang?
            </h2>
            <p className="text-xl text-blue-50">
              Start din 60 dages gratis prøveperiode i dag. Ingen risiko, ingen forpligtelser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-10 h-14 bg-white text-blue-600 hover:bg-gray-100 shadow-2xl"
                asChild
              >
                <Link href="/register">
                  Start gratis trial
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 h-14 border-2 border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href="/contact">
                  Kontakt os
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-blue-50">
              <CheckCircle2 className="h-4 w-4" />
              <span>Har du stadig spørgsmål? Vi hjælper gerne!</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
