"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Mail
} from "lucide-react";

export default function PrivacyPage() {
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
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Privatlivspolitik
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Din privatliv er
              <span className="block text-blue-600 dark:text-blue-400 mt-2">
                vores prioritet
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Hos NestList tager vi dit privatliv alvorligt. Denne politik beskriver hvordan
              vi indsamler, bruger og beskytter dine personlige oplysninger.
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
            {/* Quick Overview */}
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-2">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
                    <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    GDPR Compliant
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vi følger EU's databeskyttelsesforordning
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                    <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Dansk Hosting
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Dine data opbevares sikkert i Danmark
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto">
                    <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Dine Rettigheder
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fuld kontrol over dine persondata
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Sections */}
            <div className="space-y-8">
              {/* Section 1 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  1. Dataansvarlig
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      NestList er dataansvarlig for behandlingen af dine personoplysninger.
                      Hvis du har spørgsmål til denne privatlivspolitik eller hvordan vi behandler
                      dine data, kan du kontakte os på:
                    </p>
                    <div className="not-prose mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Email:</strong> privacy@nestlist.dk<br />
                        <strong>Support:</strong> support@nestlist.dk
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Section 2 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  2. Hvilke data indsamler vi?
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Vi indsamler kun de data, der er nødvendige for at levere vores service:
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Kontooplysninger
                    </h3>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                      <li>Navn</li>
                      <li>Email adresse</li>
                      <li>Krypteret adgangskode</li>
                      <li>Profilbillede (valgfrit)</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Brugsdata
                    </h3>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                      <li>Opgaver, lister og foldere du opretter</li>
                      <li>Indkøbslister og shopping items</li>
                      <li>Familie medlemmer og invitationer</li>
                      <li>Log af aktiviteter (hvem gjorde hvad og hvornår)</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Tekniske data
                    </h3>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                      <li>IP-adresse (kun for sikkerhed og fejlfinding)</li>
                      <li>Browser type og version</li>
                      <li>Enhedstype (mobil, tablet, desktop)</li>
                      <li>Cookies (se vores <Link href="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline">Cookie Politik</Link>)</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Betalingsdata
                    </h3>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                      <li>Vi gemmer IKKE dine betalingskortoplysninger</li>
                      <li>Alle betalinger håndteres sikkert gennem vores betalingsudbyder</li>
                      <li>Vi gemmer kun transaktions-ID og status for fakturering</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Section 3 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  3. Hvordan bruger vi dine data?
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Vi bruger dine personoplysninger til følgende formål:
                    </p>

                    <ul className="text-gray-600 dark:text-gray-300 space-y-3">
                      <li>
                        <strong>Levering af service:</strong> At give dig adgang til NestList og alle dens funktioner
                      </li>
                      <li>
                        <strong>Synkronisering:</strong> At synkronisere dine data på tværs af dine enheder
                      </li>
                      <li>
                        <strong>Samarbejde:</strong> At dele opgaver og lister med din familie
                      </li>
                      <li>
                        <strong>Support:</strong> At hjælpe dig hvis du har tekniske problemer
                      </li>
                      <li>
                        <strong>Forbedringer:</strong> At analysere hvordan tjenesten bruges for at forbedre den (anonymiseret)
                      </li>
                      <li>
                        <strong>Sikkerhed:</strong> At beskytte mod misbrug, svindel og uautoriseret adgang
                      </li>
                      <li>
                        <strong>Kommunikation:</strong> At sende dig vigtige serviceopdateringer og fakturaer
                      </li>
                    </ul>

                    <div className="not-prose mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Vi sælger ALDRIG dine data</strong> til tredjeparter eller bruger dem til reklamer.
                        Dine familiedata er private og forbliver private.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Section 4 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  4. Deling af data
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Dine data deles kun i følgende situationer:
                    </p>

                    <ul className="text-gray-600 dark:text-gray-300 space-y-3">
                      <li>
                        <strong>Med din familie:</strong> Data du vælger at dele (delte lister og opgaver) er synlige for andre familiemedlemmer
                      </li>
                      <li>
                        <strong>Service udbydere:</strong> Vi bruger pålidelige tredjeparter til hosting (servere i Danmark) og betalingsbehandling
                      </li>
                      <li>
                        <strong>Lovpligtig:</strong> Hvis vi er juridisk forpligtet til at udlevere data til myndighederne
                      </li>
                    </ul>

                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                      Vi deler ALDRIG dine data med:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                      <li>Reklame-netværk</li>
                      <li>Data-mæglere</li>
                      <li>Marketing firmaer</li>
                      <li>Andre apps eller tjenester uden dit samtykke</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Section 5 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  5. Datasikkerhed
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Vi tager datasikkerhed meget alvorligt og bruger branchen-standard sikkerhedsforanstaltninger:
                    </p>

                    <ul className="text-gray-600 dark:text-gray-300 space-y-3">
                      <li>
                        <strong>Kryptering:</strong> Alle data krypteres både under overførsel (HTTPS/TLS) og ved opbevaring
                      </li>
                      <li>
                        <strong>Adgangskoder:</strong> Adgangskoder hashet med bcrypt og gemmes aldrig i klar tekst
                      </li>
                      <li>
                        <strong>Adgangskontrol:</strong> Row Level Security sikrer at du kun kan se din families data
                      </li>
                      <li>
                        <strong>Backups:</strong> Regelmæssige automatiske backups af alle data
                      </li>
                      <li>
                        <strong>Overvågning:</strong> 24/7 sikkerhedsovervågning for at opdage og forhindre angreb
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Section 6 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  6. Dine rettigheder (GDPR)
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Under GDPR har du følgende rettigheder:
                    </p>

                    <ul className="text-gray-600 dark:text-gray-300 space-y-3">
                      <li>
                        <strong>Ret til indsigt:</strong> Du kan anmode om en kopi af alle dine persondata
                      </li>
                      <li>
                        <strong>Ret til berigtigelse:</strong> Du kan opdatere eller rette dine data i appens indstillinger
                      </li>
                      <li>
                        <strong>Ret til sletning:</strong> Du kan anmode om at få slettet din konto og alle tilknyttede data
                      </li>
                      <li>
                        <strong>Ret til dataportabilitet:</strong> Du kan eksportere dine data i et maskinlæsbart format (JSON/CSV)
                      </li>
                      <li>
                        <strong>Ret til at trække samtykke tilbage:</strong> Du kan til enhver tid trække dit samtykke tilbage
                      </li>
                      <li>
                        <strong>Ret til indsigelse:</strong> Du kan gøre indsigelse mod behandlingen af dine data
                      </li>
                    </ul>

                    <div className="not-prose mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        For at udøve dine rettigheder, kontakt os på <strong>privacy@nestlist.dk</strong>.
                        Vi svarer inden for 30 dage.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Section 7 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  7. Opbevaring af data
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      Vi opbevarer dine persondata så længe du har en aktiv konto hos os. Hvis du sletter din konto:
                    </p>

                    <ul className="text-gray-600 dark:text-gray-300 space-y-2 mt-4">
                      <li>Dine data gemmes i 90 dage i tilfælde af at du ombestemmer dig</li>
                      <li>Efter 90 dage slettes alle dine data permanent fra vores systemer</li>
                      <li>Backups med dine data slettes efter maksimalt 180 dage</li>
                      <li>Vi beholder kun transaktionsdata i 5 år af hensyn til lovkrav om bogføring</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Section 8 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  8. Børns privatliv
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      NestList er designet til familier, herunder børn. Dog:
                    </p>

                    <ul className="text-gray-600 dark:text-gray-300 space-y-2 mt-4">
                      <li>Kun voksne (18+) kan oprette familiekonti og abonnementer</li>
                      <li>Forældre kan oprette profiler for deres børn</li>
                      <li>Børneprofiler har begrænsede rettigheder (kan ikke slette familiedata)</li>
                      <li>Forældre har fuld kontrol over deres børns profiler og data</li>
                      <li>Vi indsamler kun nødvendige data for børneprofiler (navn, profilbillede)</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Section 9 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  9. Ændringer til denne politik
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      Vi kan opdatere denne privatlivspolitik fra tid til anden. Hvis vi laver væsentlige ændringer,
                      vil vi informere dig via email eller en meddelelse i appen mindst 30 dage før ændringerne træder i kraft.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                      Vi opfordrer dig til at gennemgå denne politik regelmæssigt for at holde dig opdateret om
                      hvordan vi beskytter dine data.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Section 10 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  10. Kontakt os
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Har du spørgsmål til denne privatlivspolitik eller hvordan vi behandler dine data?
                      Kontakt os gerne:
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                          <a
                            href="mailto:privacy@nestlist.dk"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            privacy@nestlist.dk
                          </a>
                        </div>
                      </div>

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
              Klar til at prøve NestList?
            </h2>
            <p className="text-xl text-blue-50">
              Vi beskytter din families privatliv, mens I får styr på hverdagen.
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
          </div>
        </div>
      </section>
    </div>
  );
}
