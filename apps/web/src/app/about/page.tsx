"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Heart,
  Users,
  Code,
  Coffee,
  Lightbulb,
  Target,
  Rocket,
  Mail
} from "lucide-react";

export default function AboutPage() {
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
              <Heart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Om NestList
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Skabt af en familie,
              <span className="block text-blue-600 dark:text-blue-400 mt-2">
                til familier
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              NestList startede ikke som en forretningsidé, men som en løsning
              på vores eget familiekaos - Mads, Tea og vores 3 vidunderlige børn.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* The Problem */}
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Vores historie
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Vi er Mads og Tea - to almindelige forældre med 3 vidunderlige børn,
                  travle karrierer, studier og en masse fritidsinteresser. Mads driver{" "}
                  <a
                    href="https://mahope.dk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    mahope.dk
                  </a>
                  {" "}som WordPress-freelancer, og Tea driver{" "}
                  <a
                    href="https://jordoghimmel.dk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Jord og Himmel
                  </a>
                  {" "}mens hun studerer. Livet var godt, men også kaotisk.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Hver uge var det det samme: Glemte indkøb. Dobbelte aftaler. Børn der
                  spurgte &ldquo;hvem henter mig i dag?&rdquo; Sticky notes overalt. SMS&apos;er der forsvandt
                  i beskedelavet. Vi prøvede alt - fra tavler på køleskabet til komplicerede
                  apps der var designet til virksomheder, ikke familier.
                </p>
              </div>
            </div>

            {/* The Solution */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
              <CardContent className="p-8 sm:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Lyspæren tændte
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  En aften, efter endnu en misforståelse om hvem der skulle købe mælk,
                  besluttede vi os: Der MÅ være en bedre løsning. Med Mads&apos; erfaring
                  som udvikler og Tea&apos;s praktiske tilgang til hverdagsudfordringer,
                  tænkte vi: &ldquo;Hvis ikke den findes, laver vi den selv.&rdquo;
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  NestList blev født i vores køkken på vores landbrug i Fyn, testet med
                  vores egne 3 børn, og forfinet gennem utallige
                  &ldquo;det ville være fedt hvis...&rdquo;-samtaler ved morgenmaden.
                  Hver funktion er tænkt igennem fra både Mads&apos; tekniske perspektiv
                  og Tea&apos;s praktiske hverdagserfaringer.
                </p>
              </CardContent>
            </Card>

            {/* The Difference */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Designet til familier
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ikke endnu et projekt management tool ombygget til familier. NestList
                    er bygget fra bunden med familie-dynamikker i tankerne: voksen/barn roller,
                    private og delte lister, smart indkøbsfunktion.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Coffee className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Lavet med kærlighed
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Hver funktion er testet i vores egen hverdag. Hvis det ikke fungerer for
                    vores familie, kommer det ikke i appen. Vi bruger selv NestList hver eneste dag.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Code className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Dansk udviklet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Udviklet i Danmark, af danskere, til danske familier. Vi forstår de
                    udfordringer du står overfor, fordi vi selv står overfor dem hver dag.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Fokuseret på jeres behov
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Vi lytter til feedback fra rigtige familier og bygger det, I har brug for -
                    ikke hvad investorer synes ville være sejt. Jeres succes er vores succes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Vores mission
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                At give alle familier de værktøjer, de har brug for til at skabe mindre kaos
                og mere kvalitetstid sammen - uden at skulle være tech-eksperter.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: Heart,
                  title: "Enkelhed først",
                  description: "Hvis vores børn ikke kan finde ud af det, er det for kompliceret."
                },
                {
                  icon: Users,
                  title: "Familie-fokus",
                  description: "Hver funktion spørger vi: Hjælper det virkelig familier?"
                },
                {
                  icon: Rocket,
                  title: "Konstant forbedring",
                  description: "Vi udvikler aktivt baseret på rigtig feedback fra rigtige familier."
                }
              ].map((item, index) => (
                <Card key={index} className="border-2 text-center">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto">
                      <item.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Bliv en del af NestList familien
            </h2>
            <p className="text-xl text-blue-50">
              Tusindvis af familier bruger allerede NestList til at få styr på hverdagen.
              Prøv det gratis i 60 dage og se selv forskellen.
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
                  <Mail className="mr-2 h-5 w-5" />
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
