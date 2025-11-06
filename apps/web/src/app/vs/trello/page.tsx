"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Check,
  X,
  Users,
  ShoppingCart,
  DollarSign,
  Calendar,
  Shield,
  Zap,
  ArrowRight
} from "lucide-react";

export default function VsTrelloPage() {
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

  const comparison = [
    {
      feature: "Designet til",
      nestlist: "Familier med børn",
      trello: "Teams og projekt management",
      winner: "nestlist"
    },
    {
      feature: "Pris pr. måned",
      nestlist: "59 kr for hele familien",
      trello: "$5 (~38 kr) pr. bruger",
      winner: "nestlist"
    },
    {
      feature: "Gratis plan",
      nestlist: "60 dages trial, derefter betalt",
      trello: "Ja, med begrænsninger (10 boards)",
      winner: "trello"
    },
    {
      feature: "Familie roller",
      nestlist: "Ja (admin, voksen, barn)",
      trello: "Nej, kun workspace permissions",
      winner: "nestlist"
    },
    {
      feature: "Smart indkøbsliste",
      nestlist: "Ja, dedikeret funktion",
      trello: "Nej, kan laves med boards",
      winner: "nestlist"
    },
    {
      feature: "Synlighedskontrol",
      nestlist: "Privat, Familie, Voksne",
      trello: "Privat eller board level",
      winner: "nestlist"
    },
    {
      feature: "Kanban boards",
      nestlist: "Nej, fokuseret på lister",
      trello: "Ja, Trello's kernefunktion",
      winner: "trello"
    },
    {
      feature: "Kalendervisning",
      nestlist: "Ja, indbygget",
      trello: "Ja (via Power-Up eller Premium)",
      winner: "nestlist"
    },
    {
      feature: "Real-time synkronisering",
      nestlist: "Ja",
      trello: "Ja",
      winner: "draw"
    },
    {
      feature: "Offline funktionalitet",
      nestlist: "Ja, fuld PWA support",
      trello: "Begrænset",
      winner: "nestlist"
    },
    {
      feature: "Mobil apps",
      nestlist: "PWA",
      trello: "Native iOS/Android apps",
      winner: "draw"
    },
    {
      feature: "Power-Ups/integrationer",
      nestlist: "Nej, alt indbygget",
      trello: "Ja, mange Power-Ups",
      winner: "trello"
    },
    {
      feature: "Tilbagevendende opgaver",
      nestlist: "Ja, indbygget",
      trello: "Kun via Power-Up (betalt)",
      winner: "nestlist"
    },
    {
      feature: "Dansk interface",
      nestlist: "Ja, 100% dansk",
      trello: "Delvis dansk oversættelse",
      winner: "nestlist"
    }
  ];

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
              NestList vs
              <span className="block text-blue-600 dark:text-blue-400 mt-2">
                Trello
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Trello's kanban boards er fantastiske til projekter, men familieopgaver handler ikke om
              boards og kolonner. NestList giver dig den simple struktur familier har brug for.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-12 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* NestList */}
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                      N
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        NestList
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Familie opgavestyring
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      <span>Designet til familier</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      <span>59 kr/md for hele familien</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      <span>Smart indkøbsliste</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      <span>Familie roller & kontrol</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      <span>Indbygget kalender</span>
                    </div>
                  </div>

                  <Button className="w-full" size="lg" asChild>
                    <Link href="/register">
                      Prøv NestList gratis
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Trello */}
              <Card className="border-2">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-2xl">
                      T
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Trello
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Kanban boards
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Check className="h-5 w-5" />
                      <span>Designet til teams</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Check className="h-5 w-5" />
                      <span>$5/md pr. bruger (~150 kr/familie)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <X className="h-5 w-5" />
                      <span>Ingen indkøbsliste</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <X className="h-5 w-5" />
                      <span>Ingen familie roller</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <X className="h-5 w-5" />
                      <span>Kalender kræver Power-Up</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" size="lg" disabled>
                    Trello
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Detaljeret sammenligning
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                En side-ved-side sammenligning af alle vigtige funktioner
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Funktion
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                      NestList
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Trello
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {comparison.map((item, index) => (
                    <tr key={index} className={item.winner === 'nestlist' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {item.feature}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.winner === 'nestlist' && (
                            <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                          )}
                          <span className={item.winner === 'nestlist' ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}>
                            {item.nestlist}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.winner === 'trello' && (
                            <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                          )}
                          <span className={item.winner === 'trello' ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}>
                            {item.trello}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Why NestList for Families */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Hvorfor vælge NestList fremfor Trello?
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Familie-specifikke features
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Trello er designet til arbejdsprojekter. NestList har familie roller (voksen/barn),
                    voksen-kun lister til følsomme ting, og smart indkøbsliste - ting Trello ikke har.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Bedre pris for familier
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Trello Standard koster $5 pr. bruger. En familie på 4 koster $20/md (~150 kr).
                    NestList koster kun 59 kr/md for hele familien - spar 91 kr hver måned.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Smart indkøbsliste
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Med Trello skal du selv bygge en indkøbsliste med boards og kolonner. NestList
                    har dedikeret indkøbsliste med automatisk kategorisering - bare tilføj varer og gå i butikken!
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Indbygget kalender
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Trello's kalendervisning kræver en betalt Power-Up. NestList har kalendervisning
                    indbygget gratis - se alle familiens opgaver med deadlines på én gang.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Beskyt følsomme oplysninger
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Med Trello ser alle board medlemmer alt. NestList's voksen-kun lister lader dig
                    holde julegaver og andre overraskelser skjult for børnene.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Enklere struktur
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Trello's boards, kolonner og kort er perfekte til projekter, men overkill for
                    daglige familieopgaver. NestList's simple lister er præcis hvad du har brug for.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* When to choose Trello */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Hvornår skal du vælge Trello?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Trello er det bedre valg hvis:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Du er fan af kanban boards og vil visualisere arbejdsflow</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Du primært bruger det til projekter (ikke daglige familieopgaver)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Du har brug for mange integrationer via Power-Ups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Du vil starte med den gratis plan (10 boards limit)</span>
                  </li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  <strong>Men hvis du leder efter et værktøj til daglige familieopgaver og indkøb,</strong> er
                  NestList meget bedre: Billigere, enklere, og med familie-specifikke features Trello ikke har.
                </p>
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
              Klar til at skifte til NestList?
            </h2>
            <p className="text-xl text-blue-50">
              Prøv NestList gratis i 60 dage og oplev forskellen på et værktøj bygget specifikt
              til familier.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-10 h-14 bg-white text-blue-600 hover:bg-gray-100 shadow-2xl"
                asChild
              >
                <Link href="/register">
                  Start gratis trial
                  <ArrowRight className="ml-2 h-5 w-5" />
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
