"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertCircle,
  Scale,
  Mail
} from "lucide-react";

export default function TermsPage() {
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

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Servicevilkår
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Servicevilkår for
              <span className="block text-blue-600 dark:text-blue-400 mt-2">
                NestList
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Disse vilkår gælder for din brug af NestList. Ved at oprette en konto accepterer
              du disse vilkår.
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sidst opdateret: 6. november 2024
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Quick Summary */}
            <Card className="border-2 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Vigtigste punkter i korte træk
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>60 dages gratis trial, derefter 59 kr/måned eller 590 kr/år</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Du kan opsige når som helst - ingen binding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Dine data slettes 90 dage efter kontosletning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Du er ansvarlig for dit indhold og din kontosikkerhed</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Detailed Sections */}
            <div className="space-y-8">
              {/* Section 1 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  1. Acceptering af vilkår
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      Ved at oprette en konto på NestList accepterer du at være bundet af disse servicevilkår.
                      Hvis du ikke accepterer vilkårene, må du ikke bruge tjenesten.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                      Disse vilkår udgør en juridisk bindende aftale mellem dig og NestList.
                      Vi forbeholder os retten til at opdatere vilkårene med minimum 30 dages varsel.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Section 2 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  2. Beskrivelse af tjenesten
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      NestList er en webbaseret familie-organisator der giver dig mulighed for at:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2 mt-4">
                      <li>Oprette og dele opgavelister med familiemedlemmer</li>
                      <li>Administrere indkøbslister med automatisk kategorisering</li>
                      <li>Organisere opgaver i foldere med farver og synlighedskontrol</li>
                      <li>Samarbejde i realtid på tværs af enheder</li>
                      <li>Bruge appen offline med PWA funktionalitet</li>
                    </ul>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                      Vi bestræber os på at levere en stabil og pålidelig tjeneste, men kan ikke garantere
                      100% oppetid eller fri for fejl.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Section 3 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  3. Kontooprettelse og ansvar
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Krav til kontooprettelse
                    </h3>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                      <li>Du skal være mindst 18 år gammel for at oprette en konto</li>
                      <li>Du skal angive korrekte og aktuelle oplysninger</li>
                      <li>Du må kun oprette én konto pr. person</li>
                      <li>Du er ansvarlig for at holde din adgangskode sikker</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Dit ansvar
                    </h3>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                      <li>Du er ansvarlig for al aktivitet på din konto</li>
                      <li>Du skal informere os øjeblikkeligt hvis din konto kompromitteres</li>
                      <li>Du må ikke dele din konto med personer uden for din familie</li>
                      <li>Du er ansvarlig for det indhold du opretter og deler</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Section 4 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  4. Abonnement og betaling
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Priser
                    </h3>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                      <li>60 dages gratis prøveperiode (ingen kreditkort påkrævet)</li>
                      <li>Månedligt abonnement: 59 kr/måned</li>
                      <li>Årligt abonnement: 590 kr/år (spar 118 kr)</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Betalingsbetingelser
                    </h3>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                      <li>Betaling sker automatisk ved slutningen af trial perioden</li>
                      <li>Abonnementet fornyes automatisk hver måned/år</li>
                      <li>Vi sender påmindelse 7 dage før første opkrævning</li>
                      <li>Alle priser er i danske kroner (DKK) inkl. moms</li>
                      <li>Vi accepterer betalingskort, MobilePay og andre danske betalingsmetoder</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Refundering
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Vi tilbyder 60 dages pengene tilbage garanti. Hvis du ikke er tilfreds med NestList
                      inden for de første 60 dage efter betaling, kan du få fuld refundering.
                      Kontakt support@nestlist.dk for at anmode om refundering.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Prisændringer
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Vi forbeholder os retten til at ændre priser med minimum 30 dages varsel.
                      Eksisterende abonnenter beholder deres nuværende pris indtil næste fornyelse
                      efter varslingsperioden.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Section 5 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  5. Opsigelse og annullering
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Din ret til opsigelse
                    </h3>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                      <li>Du kan opsige dit abonnement når som helst uden grund</li>
                      <li>Opsigelse sker via indstillinger i appen eller ved at kontakte support</li>
                      <li>Efter opsigelse har du adgang til tjenesten indtil slutningen af betalingsperioden</li>
                      <li>Der refunderes ikke for ubrugt tid i den aktuelle betalingsperiode</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Vores ret til opsigelse
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Vi kan suspendere eller opsige din konto hvis du:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2 mt-2">
                      <li>Bryder disse servicevilkår</li>
                      <li>Bruger tjenesten til ulovlige formål</li>
                      <li>Misbruger tjenesten på en måde der skader andre brugere</li>
                      <li>Ikke betaler for dit abonnement</li>
                    </ul>

                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                      Vi vil forsøge at varsle dig før suspension, medmindre omstændighederne kræver
                      øjeblikkelig handling.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Section 6 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  6. Dit indhold og data
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Ejerskab
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Du ejer og beholder alle rettigheder til det indhold du opretter i NestList
                      (opgaver, lister, noter, billeder osv.).
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Licens til os
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Ved at bruge NestList giver du os en begrænset licens til at:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2 mt-2">
                      <li>Gemme og vise dit indhold i tjenesten</li>
                      <li>Synkronisere dit indhold på tværs af dine enheder</li>
                      <li>Dele dit indhold med de familiemedlemmer du vælger</li>
                      <li>Lave backups af dit indhold</li>
                    </ul>

                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                      Denne licens ophører når du sletter dit indhold eller din konto.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Dit ansvar for indhold
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Du er ansvarlig for at sikre at dit indhold:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2 mt-2">
                      <li>Ikke krænker andres ophavsret eller andre rettigheder</li>
                      <li>Ikke er ulovligt, stødende eller krænkende</li>
                      <li>Ikke indeholder malware eller skadelig kode</li>
                      <li>Ikke misbruger eller spammer tjenesten</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Section 7 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  7. Intellektuel ejendomsret
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      NestList, inklusiv design, logo, kode, funktioner og dokumentation, er beskyttet
                      af ophavsret og andre intellektuelle ejendomsrettigheder.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                      Du må ikke:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2 mt-2">
                      <li>Kopiere, modificere eller distribuere vores kode</li>
                      <li>Reverse-engineere eller dekompilere tjenesten</li>
                      <li>Fjerne copyright notices eller branding</li>
                      <li>Bruge vores navn eller logo uden tilladelse</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Section 8 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  8. Ansvarsbegrænsning
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      NestList leveres "som den er" uden garantier af nogen art. Vi garanterer ikke at:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2 mt-4">
                      <li>Tjenesten altid vil være tilgængelig eller fejlfri</li>
                      <li>Alle fejl vil blive rettet</li>
                      <li>Tjenesten opfylder dine specifikke behov</li>
                      <li>Data aldrig går tabt (selvom vi laver backups)</li>
                    </ul>

                    <div className="not-prose mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Vigtigt:</strong> Vi er ikke ansvarlige for indirekte tab, tab af data,
                        tab af indtjening eller andre konsekvenser der opstår fra brugen af NestList.
                        Vores maksimale ansvar er begrænset til det beløb du har betalt os i de sidste 12 måneder.
                      </p>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                      Vi anbefaler kraftigt at du selv laver backup af vigtige data.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Section 9 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  9. Ændringer til tjenesten
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      Vi forbeholder os retten til at:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2 mt-4">
                      <li>Tilføje, ændre eller fjerne funktioner</li>
                      <li>Opdatere design og brugergrænseflade</li>
                      <li>Ændre tekniske krav og kompatibilitet</li>
                      <li>Midlertidigt suspendere tjenesten for vedligeholdelse</li>
                    </ul>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                      Vi vil forsøge at varsle om væsentlige ændringer, men kan ikke garantere
                      forudgående varsel i alle tilfælde.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Section 10 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  10. Lovgivning og tvister
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      Disse vilkår er underlagt dansk lov. Enhver tvist skal afgøres ved danske domstole.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                      Før du anlægger en sag, opfordrer vi dig til at kontakte os på support@nestlist.dk,
                      så vi kan forsøge at løse problemet i mindelighed.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Section 11 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  11. Kontakt
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Har du spørgsmål til disse servicevilkår? Kontakt os:
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Support</p>
                          <a
                            href="mailto:support@nestlist.dk"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            support@nestlist.dk
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Juridisk</p>
                          <a
                            href="mailto:legal@nestlist.dk"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            legal@nestlist.dk
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Klar til at komme i gang?
            </h2>
            <p className="text-xl text-blue-50">
              Prøv NestList gratis i 60 dage - ingen binding.
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
                <Link href="/pricing">
                  Se priser
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
