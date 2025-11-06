"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Cookie,
  CheckCircle2,
  Settings,
  Shield,
  Mail
} from "lucide-react";

export default function CookiesPage() {
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
              <Cookie className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Cookie Politik
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Cookies og
              <span className="block text-blue-600 dark:text-blue-400 mt-2">
                lignende teknologier
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Denne politik forklarer hvordan NestList bruger cookies og lignende teknologier
              for at levere, forbedre og beskytte vores tjeneste.
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
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Kun nødvendige
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vi bruger primært cookies der er nødvendige for tjenesten
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Ingen tracking
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vi bruger ikke cookies til at tracke dig på tværs af websites
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto">
                    <Settings className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Du har kontrol
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Du kan administrere cookies i din browser
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Sections */}
            <div className="space-y-8">
              {/* Section 1 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  1. Hvad er cookies?
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      Cookies er små tekstfiler der gemmes på din enhed (computer, tablet eller mobil)
                      når du besøger et website. De hjælper websitet med at huske information om dit besøg,
                      som dine præferencer og login status.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                      Udover cookies bruger vi også lignende teknologier såsom:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2 mt-2">
                      <li><strong>Local Storage:</strong> Bruges til at gemme data lokalt i din browser</li>
                      <li><strong>Session Storage:</strong> Midlertidig lagring der slettes når du lukker browseren</li>
                      <li><strong>IndexedDB:</strong> Bruges til offline funktionalitet i PWA</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Section 2 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  2. Hvilke cookies bruger vi?
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      NestList bruger følgende typer af cookies:
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Strengt nødvendige cookies
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Disse cookies er essentielle for at tjenesten kan fungere. Du kan ikke slå dem fra.
                    </p>

                    <div className="not-prose">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Cookie navn</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Formål</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Varighed</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                              <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                                next-auth.session-token
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                Sikrer at du forbliver logget ind
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                30 dage
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                                next-auth.csrf-token
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                Beskytter mod CSRF angreb
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                Session
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                                next-auth.callback-url
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                Husker hvor du skal sendes efter login
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                Session
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
                      Funktionelle cookies
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Disse cookies husker dine valg og præferencer.
                    </p>

                    <div className="not-prose">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Cookie navn</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Formål</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Varighed</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                              <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                                theme
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                Husker om du bruger lyst eller mørkt tema
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                1 år
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                                language
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                Husker dit sprog valg
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                1 år
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
                      Performance cookies (valgfrie)
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Disse cookies hjælper os med at forstå hvordan tjenesten bruges (anonymiseret data).
                    </p>

                    <div className="not-prose">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Cookie navn</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Formål</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">Varighed</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                              <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                                _analytics
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                Anonymiseret brug statistik
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                1 år
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="not-prose mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Bemærk:</strong> Vi bruger IKKE cookies til reklame, tracking på tværs af websites
                        eller salg af data til tredjeparter.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Section 3 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  3. Tredjepartscookies
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      I nogle tilfælde bruger vi tredjepartstjenester der kan sætte deres egne cookies:
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Betalingsudbyder
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Når du betaler for dit abonnement, kan vores betalingsudbyder sætte cookies for at
                      sikre transaktionen. Disse cookies er strengt nødvendige for betalingsprocessen.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Fejlrapportering
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Vi bruger fejlrapporteringsværktøjer til at opdage og rette bugs. Disse værktøjer
                      kan sætte cookies, men indsamler ikke personligt identificerbare oplysninger.
                    </p>

                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                      Vi har ingen kontrol over tredjepartscookies. Se disse tjenester privatlivspolitikker
                      for mere information om deres brug af cookies.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Section 4 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  4. Local Storage og IndexedDB
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      Udover cookies bruger NestList også browser storage teknologier:
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      Local Storage
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Vi gemmer følgende i Local Storage:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2 mt-2">
                      <li>Tema præference (lys/mørk)</li>
                      <li>Sidste besøgte side</li>
                      <li>UI præferencer (sidebar collapsed, osv.)</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                      IndexedDB
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      For at give dig offline funktionalitet, cacher vi data i IndexedDB:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2 mt-2">
                      <li>Dine opgaver og lister (så du kan arbejde offline)</li>
                      <li>Profil information</li>
                      <li>Seneste synkroniseringstidspunkt</li>
                    </ul>

                    <div className="not-prose mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Sikkerhed:</strong> Alle data i Local Storage og IndexedDB er krypteret
                        og kun tilgængelige for NestList på din enhed.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Section 5 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  5. Sådan administrerer du cookies
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      I din browser
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      De fleste browsere tillader dig at kontrollere cookies gennem indstillingerne:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2 mt-4">
                      <li>
                        <strong>Chrome:</strong> Indstillinger → Privatliv og sikkerhed → Cookies og andre webstedsdata
                      </li>
                      <li>
                        <strong>Firefox:</strong> Indstillinger → Privatliv og sikkerhed → Cookies og webstedsdata
                      </li>
                      <li>
                        <strong>Safari:</strong> Indstillinger → Privatliv → Blokér alle cookies
                      </li>
                      <li>
                        <strong>Edge:</strong> Indstillinger → Cookies og webstedstilladelser
                      </li>
                    </ul>

                    <div className="not-prose mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Bemærk:</strong> Hvis du blokerer strengt nødvendige cookies, vil du ikke
                        kunne bruge NestList, da login og session håndtering kræver cookies.
                      </p>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">
                      I NestList
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Du kan administrere valgfrie cookies (analytics) i appens indstillinger når du er logget ind:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-300 space-y-2 mt-2">
                      <li>Gå til Indstillinger → Privatliv</li>
                      <li>Vælg "Cookie præferencer"</li>
                      <li>Slå performance cookies til eller fra</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Section 6 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  6. Opdateringer til denne politik
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6 prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      Vi kan opdatere denne cookie politik fra tid til anden for at afspejle ændringer
                      i vores brug af cookies eller nye krav i lovgivningen.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">
                      Hvis vi laver væsentlige ændringer, vil vi informere dig via email eller
                      en meddelelse i appen.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Section 7 */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  7. Kontakt os
                </h2>
                <Card className="border-2">
                  <CardContent className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Har du spørgsmål til vores brug af cookies? Kontakt os:
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

            {/* Related Links */}
            <Card className="border-2 bg-gray-50 dark:bg-gray-800/50">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Læs også
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" asChild>
                    <Link href="/privacy">
                      Privatlivspolitik
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/terms">
                      Servicevilkår
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
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
              Vi respekterer din privatliv og bruger kun nødvendige cookies.
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
