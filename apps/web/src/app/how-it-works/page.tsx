"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  UserPlus,
  Users,
  ListPlus,
  CheckSquare,
  Share2,
  Bell,
  Sparkles,
  ArrowRight,
  Play
} from "lucide-react";

export default function HowItWorksPage() {
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

  const steps = [
    {
      step: 1,
      icon: UserPlus,
      title: "Opret din gratis konto",
      description: "Kom i gang på under 2 minutter. Ingen kreditkort påkrævet for 60 dages gratis trial.",
      details: [
        "Gå til registreringssiden og udfyld formularen",
        "Indtast dit navn, email og vælg en sikker adgangskode",
        "Bekræft din email (tjek også spam-mappen)",
        "Log ind og velkommen til NestList!"
      ],
      color: "blue"
    },
    {
      step: 2,
      icon: Users,
      title: "Opret din familie",
      description: "Giv din familie et navn og inviter medlemmer til at deltage.",
      details: [
        "Vælg et navn til din familie (f.eks. 'Jensen Familien')",
        "Gå til Indstillinger → Familiemedlemmer",
        "Klik 'Inviter medlem' og send invitations-email",
        "Familiemedlemmer kan oprette konto og automatisk blive tilknyttet"
      ],
      color: "green"
    },
    {
      step: 3,
      icon: ListPlus,
      title: "Opret dine første lister",
      description: "Start med en indkøbsliste eller en opgaveliste for hjemmet.",
      details: [
        "Klik på + knappen for at oprette en ny liste",
        "Vælg listetype: Normal opgaveliste eller Indkøbsliste",
        "Giv listen et navn og vælg synlighed (privat, familie, voksne)",
        "Tilføj en farve for nem identifikation"
      ],
      color: "purple"
    },
    {
      step: 4,
      icon: CheckSquare,
      title: "Tilføj opgaver",
      description: "Opret opgaver med deadlines, tildel familiemedlemmer, og tilføj detaljer.",
      details: [
        "Klik i en liste for at tilføje en opgave",
        "Skriv opgavetitel og tilføj eventuelle detaljer",
        "Sæt en deadline hvis nødvendigt",
        "Tildel opgaven til et eller flere familiemedlemmer",
        "Tilføj tags for bedre organisering"
      ],
      color: "orange"
    },
    {
      step: 5,
      icon: Share2,
      title: "Samarbejd med familien",
      description: "Se real-time opdateringer når familiemedlemmer markerer opgaver som færdige.",
      details: [
        "Alle familiemedlemmer ser de samme delte lister",
        "Når én person opdaterer, ser alle andre det øjeblikkeligt",
        "Kommenter på opgaver for at koordinere",
        "Se aktivitetslogen for at følge fremskridt"
      ],
      color: "pink"
    },
    {
      step: 6,
      icon: Bell,
      title: "Aktiver notifikationer",
      description: "Få påmindelser om deadlines og opdateringer fra familien.",
      details: [
        "Gå til Indstillinger → Notifikationer",
        "Tillad push notifikationer i din browser/telefon",
        "Vælg hvilke typer notifikationer du vil modtage",
        "Modtag påmindelser om kommende deadlines"
      ],
      color: "red"
    }
  ];

  const colorMap = {
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800"
    },
    green: {
      bg: "bg-green-100 dark:bg-green-900/20",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800"
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800"
    },
    orange: {
      bg: "bg-orange-100 dark:bg-orange-900/20",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-800"
    },
    pink: {
      bg: "bg-pink-100 dark:bg-pink-900/20",
      text: "text-pink-600 dark:text-pink-400",
      border: "border-pink-200 dark:border-pink-800"
    },
    red: {
      bg: "bg-red-100 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-800"
    }
  };

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
              <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Sådan virker det
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Kom i gang med NestList
              <span className="block text-blue-600 dark:text-blue-400 mt-2">
                på 6 nemme trin
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Fra registrering til at hele familien samarbejder om opgaver - følg denne
              simple guide og vær i gang på under 10 minutter.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-16">
              {steps.map((step, index) => {
                const colors = colorMap[step.color as keyof typeof colorMap];
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={index}
                    className={`grid lg:grid-cols-2 gap-12 items-center ${
                      !isEven ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Content */}
                    <div className={`space-y-6 ${!isEven ? "lg:order-2" : ""}`}>
                      <div className="flex items-center gap-4">
                        <div className={`${colors.bg} ${colors.text} h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-bold`}>
                          {step.step}
                        </div>
                        <div className={`${colors.bg} ${colors.text} h-12 w-12 rounded-xl flex items-center justify-center`}>
                          <step.icon className="h-6 w-6" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                          {step.title}
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                          {step.description}
                        </p>
                      </div>

                      <Card className={`border-2 ${colors.border}`}>
                        <CardContent className="p-6">
                          <ul className="space-y-3">
                            {step.details.map((detail, dIndex) => (
                              <li key={dIndex} className="flex items-start gap-3">
                                <div className={`${colors.bg} ${colors.text} h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold`}>
                                  {dIndex + 1}
                                </div>
                                <span className="text-gray-600 dark:text-gray-300">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Visual */}
                    <div className={!isEven ? "lg:order-1" : ""}>
                      <Card className="border-2">
                        <CardContent className={`p-12 ${colors.bg} border-2 ${colors.border}`}>
                          <div className="aspect-square flex items-center justify-center">
                            <div className={`${colors.text} h-32 w-32 rounded-3xl bg-white dark:bg-gray-800 flex items-center justify-center`}>
                              <step.icon className="h-16 w-16" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connection lines would go here in a more advanced version */}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Tips til at få mest ud af NestList
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Her er nogle best practices fra familier der allerede bruger NestList
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Start simpelt
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Begynd med én eller to lister (f.eks. indkøb og husarbejde). Tilføj flere
                    funktioner som mapper og tags efterhånden som I bliver fortrolige med systemet.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Involver hele familien
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Jo flere der bruger NestList, jo mere værdifuld bliver den. Sørg for at alle
                    familiemedlemmer får deres egen konto og ved hvordan man bruger appen.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Brug notifikationer smart
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Aktiver påmindelser for vigtige deadlines, men undgå at blive spammet. Find den
                    rette balance så notifikationer er nyttige, ikke irriterende.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <CheckSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    Gennemgå regelmæssigt
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tag 5 minutter hver søndag til at gennemgå ugens opgaver med familien. Tildel
                    ansvarsområder og sørg for at alle ved hvad der skal gøres.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Hvordan familier bruger NestList
              </h2>
            </div>

            <div className="space-y-8">
              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">👨‍👩‍👧‍👦</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Jensen Familien (4 personer)
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        "Vi bruger NestList primært til indkøb og husarbejde. Børnene (10 og 13 år) har hver
                        deres liste med ugentlige opgaver, og vi har en fælles indkøbsliste hvor alle kan
                        tilføje ting. Det har sparet os for utallige diskussioner om hvem der skulle gøre hvad!"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">👵👴</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Mortensen Familien (2 voksne + 2 børn på uni)
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        "Selvom børnene er flyttet hjemmefra, bruger vi stadig NestList til at koordinere
                        familie sammenkomster, dele opskrifter, og holde styr på fødselsdagsgaver. Det
                        er blevet vores digitale familie hub."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">👶</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Andersen Familien (2 voksne + 1 baby)
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        "Med en lille baby er det kaos! NestList hjælper os med at huske ble-indkøb,
                        vaccination datoer, og koordinere hvem der står op om natten. Vores
                        'Baby essentials' liste er genialt!"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
              Det tager kun 2 minutter at oprette en konto og begynde at organisere familielivet.
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
                <Link href="/faq">
                  Læs FAQ
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
