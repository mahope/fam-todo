"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Sparkles,
  Bug,
  Wrench,
  Plus,
  Zap,
  Shield,
  Smartphone
} from "lucide-react";

export default function ChangelogPage() {
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

  const changelog = [
    {
      version: "1.2.0",
      date: "6. november 2024",
      type: "major",
      changes: [
        {
          type: "feature",
          title: "Komplet marketing site",
          description: "Tilføjet omfattende landing pages inkl. Pricing, About, Contact, FAQ, Features, How It Works, plus juridiske sider (Privacy, Terms, Cookies)."
        },
        {
          type: "feature",
          title: "Hjælpecenter",
          description: "Nyt hjælpecenter med kategoriserede guides og troubleshooting artikler."
        },
        {
          type: "improvement",
          title: "Forbedret SEO",
          description: "Optimeret metadata og struktureret data på alle sider for bedre synlighed i søgemaskiner."
        }
      ]
    },
    {
      version: "1.1.0",
      date: "28. oktober 2024",
      type: "minor",
      changes: [
        {
          type: "feature",
          title: "PWA offline support",
          description: "NestList kan nu bruges offline! Dine data caches lokalt og synkroniseres automatisk når du kommer online igen."
        },
        {
          type: "feature",
          title: "Push notifikationer",
          description: "Få påmindelser om deadlines og nye tildelinger direkte på din telefon eller desktop."
        },
        {
          type: "improvement",
          title: "Hurtigere indlæsning",
          description: "Optimeret performance med intelligent caching og prefetching. Appen loader nu 40% hurtigere."
        },
        {
          type: "fix",
          title: "Synkroniseringsbug",
          description: "Rettet et problem hvor ændringer ikke altid synkroniserede korrekt mellem enheder."
        }
      ]
    },
    {
      version: "1.0.5",
      date: "15. oktober 2024",
      type: "patch",
      changes: [
        {
          type: "feature",
          title: "Farvevalg for mapper",
          description: "Du kan nu tildele farver til mapper for bedre organisering og hurtig identifikation."
        },
        {
          type: "improvement",
          title: "Forbedret indkøbsliste",
          description: "Bedre autocomplete og mere præcis kategorisering af produkter."
        },
        {
          type: "fix",
          title: "Safari kompatibilitet",
          description: "Rettet flere UI problemer specifikt for Safari browseren."
        },
        {
          type: "fix",
          title: "Notifikationslydstyring",
          description: "Notifikationslyde respekterer nu systemets lydindstillinger."
        }
      ]
    },
    {
      version: "1.0.0",
      date: "1. oktober 2024",
      type: "major",
      changes: [
        {
          type: "feature",
          title: "Officiel lancering! 🎉",
          description: "NestList er nu officielt lanceret med alle kernefunktioner klar til brug."
        },
        {
          type: "feature",
          title: "Familie samarbejde",
          description: "Opret familier, inviter medlemmer, og samarbejd i realtid på opgaver og lister."
        },
        {
          type: "feature",
          title: "Smart indkøbsliste",
          description: "Automatisk kategorisering og autocomplete for hurtigere indkøb."
        },
        {
          type: "feature",
          title: "Kalendervisning",
          description: "Se alle opgaver i en overskuelig kalender med drag & drop support."
        },
        {
          type: "feature",
          title: "Private og delte lister",
          description: "Fuld kontrol over hvem der kan se dine lister med 3 synlighedsniveauer."
        },
        {
          type: "feature",
          title: "Mobil-først design",
          description: "Responsivt design optimeret til mobil, tablet og desktop."
        }
      ]
    },
    {
      version: "0.9.0 (Beta)",
      date: "15. september 2024",
      type: "minor",
      changes: [
        {
          type: "feature",
          title: "Tilbagevendende opgaver",
          description: "Opret opgaver der gentager sig dagligt, ugentligt eller månedligt."
        },
        {
          type: "feature",
          title: "Tags og kategorier",
          description: "Organiser opgaver med custom tags på tværs af lister."
        },
        {
          type: "improvement",
          title: "Forbedret søgning",
          description: "Hurtigere og mere præcis søgning med fuzzy matching."
        },
        {
          type: "fix",
          title: "Database performance",
          description: "Optimeret database queries for hurtigere responstider."
        }
      ]
    }
  ];

  const typeIcons = {
    feature: { icon: Plus, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/20" },
    improvement: { icon: Zap, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/20" },
    fix: { icon: Wrench, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/20" },
    security: { icon: Shield, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/20" }
  };

  const versionBadgeColors = {
    major: "bg-blue-600 dark:bg-blue-500",
    minor: "bg-green-600 dark:bg-green-500",
    patch: "bg-gray-600 dark:bg-gray-500"
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
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Changelog
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Hvad er nyt i
              <span className="block text-blue-600 dark:text-blue-400 mt-2">
                NestList?
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Se alle opdateringer, nye funktioner og forbedringer. Vi udvikler aktivt NestList
              baseret på feedback fra rigtige familier.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {changelog.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Versioner udgivet
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {changelog.reduce((acc, release) =>
                    acc + release.changes.filter(c => c.type === 'feature').length, 0
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Nye funktioner
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {changelog.reduce((acc, release) =>
                    acc + release.changes.filter(c => c.type === 'fix').length, 0
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Bugs rettet
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Changelog Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {changelog.map((release, index) => (
                <Card key={index} className="border-2 overflow-hidden">
                  {/* Release Header */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${versionBadgeColors[release.type as keyof typeof versionBadgeColors]} text-white text-sm font-semibold`}>
                          {release.version}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {release.date}
                        </span>
                      </div>
                      {index === 0 && (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                          NYESTE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Changes */}
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {release.changes.map((change, cIndex) => {
                        const typeConfig = typeIcons[change.type as keyof typeof typeIcons];
                        const Icon = typeConfig.icon;

                        return (
                          <div key={cIndex} className="flex items-start gap-4">
                            <div className={`${typeConfig.bg} ${typeConfig.color} h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {change.title}
                                </h3>
                                <span className={`text-xs px-2 py-0.5 rounded ${typeConfig.bg} ${typeConfig.color} font-medium`}>
                                  {change.type === 'feature' ? 'NY' :
                                   change.type === 'improvement' ? 'FORBEDRING' :
                                   change.type === 'fix' ? 'FIX' : 'SIKKERHED'}
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {change.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Kommer snart
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Vi arbejder på disse spændende nye funktioner
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Template lister",
                  description: "Opret genbrugelige skabeloner for almindelige lister (f.eks. 'Ugens indkøb', 'Weekend rengøring')",
                  icon: Plus
                },
                {
                  title: "Fil vedhæftning",
                  description: "Vedhæft billeder, dokumenter og filer direkte til opgaver",
                  icon: Smartphone
                },
                {
                  title: "Avanceret sortering",
                  description: "Flere sorteringsmuligheder og gem dine foretrukne filter kombinationer",
                  icon: Zap
                },
                {
                  title: "Integration med kalender",
                  description: "Synkroniser opgaver med Google Calendar og Apple Calendar",
                  icon: Sparkles
                }
              ].map((item, index) => (
                <Card key={index} className="border-2 border-dashed">
                  <CardContent className="p-6 space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Har du en idé til en ny funktion?
              </p>
              <Button asChild variant="outline">
                <Link href="/contact">
                  Send os dit forslag
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Oplev alle de nye funktioner
            </h2>
            <p className="text-xl text-blue-50">
              Start din 60 dages gratis prøveperiode og få adgang til alle funktioner.
            </p>
            <Button
              size="lg"
              className="text-lg px-10 h-14 bg-white text-blue-600 hover:bg-gray-100 shadow-2xl"
              asChild
            >
              <Link href="/register">
                Start gratis trial
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
