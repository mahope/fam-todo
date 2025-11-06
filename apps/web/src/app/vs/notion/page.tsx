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
  Zap,
  DollarSign,
  Globe,
  Brain,
  Smartphone,
  ArrowRight
} from "lucide-react";

export default function VsNotionPage() {
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
      notion: "Teams og knowledge workers",
      winner: "nestlist"
    },
    {
      feature: "Pris pr. måned",
      nestlist: "59 kr for hele familien",
      notion: "$10 (~75 kr) pr. bruger",
      winner: "nestlist"
    },
    {
      feature: "Gratis trial",
      nestlist: "60 dage",
      notion: "Gratis plan med begrænsninger",
      winner: "nestlist"
    },
    {
      feature: "Læringskurve",
      nestlist: "Meget simpel - børn kan bruge det",
      notion: "Stejl - tager tid at lære",
      winner: "nestlist"
    },
    {
      feature: "Familie roller",
      nestlist: "Ja (admin, voksen, barn)",
      notion: "Nej, kun workspace permissions",
      winner: "nestlist"
    },
    {
      feature: "Smart indkøbsliste",
      nestlist: "Ja, dedikeret funktion",
      notion: "Nej, kan bygges med databaser",
      winner: "nestlist"
    },
    {
      feature: "Opgavestyring",
      nestlist: "Simpel og fokuseret",
      notion: "Meget fleksibel men kompleks",
      winner: "draw"
    },
    {
      feature: "Wiki/dokumentation",
      nestlist: "Nej",
      notion: "Ja, omfattende wiki features",
      winner: "notion"
    },
    {
      feature: "Databaser",
      nestlist: "Nej",
      notion: "Ja, kraftfulde relationelle databaser",
      winner: "notion"
    },
    {
      feature: "Real-time samarbejde",
      nestlist: "Ja",
      notion: "Ja",
      winner: "draw"
    },
    {
      feature: "Mobil app hastighed",
      nestlist: "Meget hurtig (PWA)",
      notion: "Kan være langsom",
      winner: "nestlist"
    },
    {
      feature: "Offline funktionalitet",
      nestlist: "Ja, fuld support",
      notion: "Begrænset offline support",
      winner: "nestlist"
    },
    {
      feature: "Dansk interface",
      nestlist: "Ja, 100% dansk",
      notion: "Engelsk med delvis oversættelse",
      winner: "nestlist"
    },
    {
      feature: "Fleksibilitet",
      nestlist: "Fokuseret på opgaver",
      notion: "Ekstremt fleksibel - kan bygge næsten alt",
      winner: "notion"
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
                Notion
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Notion er et kraftfuldt all-in-one workspace, men det er overkill for de fleste familier.
              NestList giver dig præcis hvad du behøver - intet mere, intet mindre.
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
                        Simpel familie-organisator
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      <span>Simpel at lære og bruge</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      <span>59 kr/md for hele familien</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      <span>Børnevenlig interface</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      <span>Hurtig og responsiv</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      <span>Fokuseret på det essentielle</span>
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

              {/* Notion */}
              <Card className="border-2">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-gray-900 dark:bg-gray-700 flex items-center justify-center text-white font-bold text-2xl">
                      N
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Notion
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        All-in-one workspace
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Check className="h-5 w-5" />
                      <span>Meget fleksibel og kraftfuld</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <X className="h-5 w-5" />
                      <span>$10/md pr. bruger (~300 kr/familie)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <X className="h-5 w-5" />
                      <span>Stejl læringskurve</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <X className="h-5 w-5" />
                      <span>Kan være langsom</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <X className="h-5 w-5" />
                      <span>Mange funktioner du ikke bruger</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" size="lg" disabled>
                    Notion
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
                      Notion
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
                          {item.winner === 'notion' && (
                            <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                          )}
                          <span className={item.winner === 'notion' ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}>
                            {item.notion}
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
                Hvorfor vælge NestList fremfor Notion?
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Simpelt og hurtigt
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Notion kan alt - og det er problemet. Det er komplekst, langsomt og kræver meget opsætning.
                    NestList er bygget præcis til opgavestyring for familier - intet mere, intet mindre.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Meget billigere
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Notion Plus koster $10 pr. person. En familie på 4 koster $40/md (~300 kr)!
                    NestList koster kun 59 kr/md for hele familien - spar 241 kr hver måned.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Børnevenlig
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Notion's interface er designet til professionelle. Det er overvældende for børn.
                    NestList er så simpelt at selv små børn kan bruge det uden problemer.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Ingen læringskurve
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Notion tager timer at lære og dage at sætte op. NestList er intuitivt fra dag 1 -
                    opret en konto og kom i gang på 2 minutter.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Familie-specifikke features
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Notion har ikke familie roller, voksen-kun lister, eller smart indkøbsliste.
                    Du skal selv bygge alt fra bunden. NestList har alt dette indbygget.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Meget hurtigere
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Notion er notorisk langsom, især på mobil. NestList er lynhurtigt med instant
                    opdateringer og optimistic UI. Mærk forskellen!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* When to choose Notion */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Hvornår skal du vælge Notion?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Notion er det bedre valg hvis:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Du har brug for wikis, dokumentation og knowledge management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Du vil bygge custom databaser og workflows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Du bruger det primært til arbejde, ikke familie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Du har tid og lyst til at sætte et komplekst system op</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Du har brug for maksimal fleksibilitet og tilpasningsmuligheder</span>
                  </li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  <strong>Men hvis du bare vil have et simpelt værktøj til at organisere din families opgaver,</strong>
                  er NestList meget bedre: Billigere, hurtigere, og meget nemmere at bruge.
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
              Vælg simpliciteten
            </h2>
            <p className="text-xl text-blue-50">
              Hvorfor bruge timer på at sætte Notion op når NestList giver dig alt du behøver out-of-the-box?
              Prøv gratis i 60 dage.
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
