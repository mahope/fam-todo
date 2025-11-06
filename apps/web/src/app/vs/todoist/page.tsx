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
  Globe,
  Shield,
  Smartphone,
  ArrowRight
} from "lucide-react";

export default function VsTodoistPage() {
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
      nestlist: "Familier med børn og voksne",
      todoist: "Individuelle brugere og teams",
      winner: "nestlist"
    },
    {
      feature: "Pris pr. måned",
      nestlist: "59 kr for hele familien",
      todoist: "€6.99 (~52 kr) pr. bruger",
      winner: "nestlist"
    },
    {
      feature: "Gratis trial",
      nestlist: "60 dage",
      todoist: "30 dage",
      winner: "nestlist"
    },
    {
      feature: "Familie roller",
      nestlist: "Ja (admin, voksen, barn)",
      todoist: "Nej",
      winner: "nestlist"
    },
    {
      feature: "Smart indkøbsliste",
      nestlist: "Ja, med automatisk kategorisering",
      todoist: "Nej, kun almindelige lister",
      winner: "nestlist"
    },
    {
      feature: "Voksen-kun lister",
      nestlist: "Ja (f.eks. til julegaver)",
      todoist: "Nej",
      winner: "nestlist"
    },
    {
      feature: "Offline funktionalitet",
      nestlist: "Ja, fuld PWA support",
      todoist: "Ja (kun i apps)",
      winner: "draw"
    },
    {
      feature: "Mobil apps",
      nestlist: "PWA (installer fra browser)",
      todoist: "Native iOS/Android apps",
      winner: "todoist"
    },
    {
      feature: "Real-time synkronisering",
      nestlist: "Ja",
      todoist: "Ja",
      winner: "draw"
    },
    {
      feature: "Tilbagevendende opgaver",
      nestlist: "Ja",
      todoist: "Ja (mere avanceret)",
      winner: "todoist"
    },
    {
      feature: "Kalendervisning",
      nestlist: "Ja, indbygget",
      todoist: "Kun via integration",
      winner: "nestlist"
    },
    {
      feature: "Dansk interface",
      nestlist: "Ja, 100% dansk",
      todoist: "Ja, men dansk support?",
      winner: "nestlist"
    },
    {
      feature: "GDPR & dansk hosting",
      nestlist: "Ja, data i Danmark",
      todoist: "GDPR compliant, ikke dansk hosting",
      winner: "nestlist"
    },
    {
      feature: "Productivity features",
      nestlist: "Fokuseret på familie behov",
      todoist: "Mere avancerede productivity features",
      winner: "todoist"
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
                Todoist
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Todoist er fantastisk til individuel produktivitet, men NestList er bygget specifikt
              til familier. Her er hvorfor NestList er det bedre valg for din familie.
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
                        Familie-organisator
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
                      <span>60 dages gratis trial</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      <span>Smart indkøbsliste</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="h-5 w-5" />
                      <span>Familie roller & kontrol</span>
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

              {/* Todoist */}
              <Card className="border-2">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-2xl">
                      T
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Todoist
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Opgavestyring
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Check className="h-5 w-5" />
                      <span>Designet til individer</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Check className="h-5 w-5" />
                      <span>€6.99/md pr. bruger</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Check className="h-5 w-5" />
                      <span>30 dages gratis trial</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <X className="h-5 w-5" />
                      <span>Ingen indkøbsliste</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <X className="h-5 w-5" />
                      <span>Ingen familie roller</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" size="lg" disabled>
                    Todoist
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
                      Todoist
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
                          {item.winner === 'todoist' && (
                            <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                          )}
                          <span className={item.winner === 'todoist' ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}>
                            {item.todoist}
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
                Hvorfor vælge NestList til din familie?
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Familie-først design
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Todoist er bygget til individer. NestList er designet fra bunden til familier
                    med børn, inkl. roller, synlighedskontrol og familie-specifikke features.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Meget bedre pris for familier
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Med Todoist betaler du €6.99 pr. person. En familie på 4 koster €27.96/md (~210 kr).
                    NestList koster kun 59 kr/md for hele familien - spar 151 kr hver måned!
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
                    Todoist har ikke indkøbsliste funktionalitet. NestList har dedikeret
                    indkøbsliste med automatisk kategorisering og autocomplete - perfekt til familien.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Beskyt følsomme oplysninger
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Med NestList's voksen-kun lister kan du holde julegaver, overraskelser og andre
                    følsomme ting skjult for børnene. Todoist har ikke denne funktion.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    100% dansk
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    NestList er udviklet i Danmark, af danskere, til danske familier. Dansk support,
                    dansk hosting, og vi forstår de udfordringer du står overfor.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Nem for børn at bruge
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Todoist's interface er komplekst med mange produktivitetsfunktioner. NestList er
                    simpelt nok til at selv børn kan bruge det uden problemer.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* When to choose Todoist */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Hvornår skal du vælge Todoist?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Todoist er det bedre valg hvis:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Du primært bruger det til personlig produktivitet (ikke familie)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Du har brug for meget avancerede productivity features (karma points, prioriteter osv.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Du foretrækker native mobil apps frem for PWA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>Du har brug for omfattende integrationer med andre værktøjer</span>
                  </li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  <strong>Men hvis du leder efter et værktøj til at organisere din familie,</strong> er
                  NestList det klart bedre valg med lavere pris og familie-specifikke funktioner.
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
              Prøv NestList gratis i 60 dage - dobbelt så lang trial som Todoist - og se hvorfor
              familier vælger os.
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
