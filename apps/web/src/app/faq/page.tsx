"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  HelpCircle,
  ChevronDown,
  Search,
  Mail
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function FAQPage() {
  const { data: session, status } = useSession();
  const isPending = status === "loading";
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  const faqCategories = [
    {
      category: "Kom i gang",
      questions: [
        {
          q: "Hvordan opretter jeg en konto?",
          a: "Klik på 'Start gratis trial' knappen øverst på siden. Udfyld formularen med dit navn, email og adgangskode. Du får derefter adgang til NestList uden at skulle indtaste kreditkortoplysninger."
        },
        {
          q: "Hvor lang tid tager det at komme i gang?",
          a: "Det tager cirka 2 minutter at oprette en konto og oprette din første familie. Derefter kan du straks begynde at oprette opgaver, lister og invitere familiemedlemmer."
        },
        {
          q: "Skal jeg downloade en app?",
          a: "Nej, NestList er en webbaseret app der fungerer i din browser. Men du kan installere den som en PWA (Progressive Web App) på din telefon eller tablet for en app-lignende oplevelse med offline funktionalitet."
        },
        {
          q: "Hvordan inviterer jeg min familie?",
          a: "Når du har oprettet en konto, gå til Indstillinger → Familiemedlemmer → Inviter medlem. Send en invitation via email, og modtageren kan oprette en konto og automatisk blive tilknyttet din familie."
        }
      ]
    },
    {
      category: "Abonnement & Betaling",
      questions: [
        {
          q: "Hvad koster NestList?",
          a: "NestList tilbyder 60 dages gratis trial. Derefter koster det 59 kr/måned eller 590 kr/år (spar 118 kr). Alle priser er i danske kroner inkl. moms."
        },
        {
          q: "Skal jeg indtaste kreditkort for at prøve?",
          a: "Nej! 60 dages gratis trial kræver ikke kreditkort. Vi spørger først om betalingsoplysninger når trial perioden udløber, hvis du vælger at fortsætte."
        },
        {
          q: "Hvad sker der når trial perioden udløber?",
          a: "7 dage før din trial udløber, sender vi dig en påmindelse via email. Du kan derefter vælge at tilmelde dig et abonnement eller lade kontoen udløbe. Ingen automatisk opkrævning uden dit samtykke!"
        },
        {
          q: "Kan jeg opsige mit abonnement?",
          a: "Ja, når som helst! Gå til Indstillinger → Abonnement → Opsig. Du har adgang til NestList indtil slutningen af din betalingsperiode. Ingen skjulte gebyrer eller binding."
        },
        {
          q: "Tilbyder I refundering?",
          a: "Ja! Vi har 60 dages pengene tilbage garanti. Hvis du ikke er tilfreds inden for de første 60 dage efter betaling, kontakter du support@nestlist.dk for fuld refundering."
        },
        {
          q: "Hvilke betalingsmetoder accepterer I?",
          a: "Vi accepterer alle større betalingskort (Visa, Mastercard, American Express), MobilePay og andre danske betalingsmetoder via vores sikre betalingsudbyder."
        }
      ]
    },
    {
      category: "Funktioner & Brug",
      questions: [
        {
          q: "Hvad er forskellen mellem private, familie og voksen lister?",
          a: "Private lister er kun synlige for dig. Familie lister kan ses af alle familiemedlemmer. Voksen lister er kun synlige for voksne i familien (ikke børn). Du kan ændre synlighed på enhver liste."
        },
        {
          q: "Hvordan fungerer indkøbslisten?",
          a: "Opret en liste med type 'Indkøb'. Når du tilføjer varer, foreslår NestList automatisk kategorier (mejeriprodukter, frugt & grønt osv.). Varer kan markeres som købt uden at blive slettet."
        },
        {
          q: "Kan jeg bruge NestList offline?",
          a: "Ja! NestList er en PWA med offline support. Dine data caches lokalt, så du kan se og redigere opgaver selv uden internet. Ændringer synkroniseres automatisk når du kommer online igen."
        },
        {
          q: "Hvordan får jeg notifikationer?",
          a: "Gå til Indstillinger → Notifikationer og aktiver push notifikationer. Du kan vælge hvilke typer notifikationer du vil modtage (deadlines, nye opgaver, kommentarer osv.)."
        },
        {
          q: "Kan jeg organisere opgaver i foldere?",
          a: "Ja! Opret foldere for at gruppere relaterede lister. For eksempel en 'Hus' folder med lister for rengøring, vedligeholdelse og projekter. Foldere kan også have synlighedskontrol."
        },
        {
          q: "Hvordan tildeler jeg opgaver til familiemedlemmer?",
          a: "Når du opretter eller redigerer en opgave, klik på 'Tildel til' og vælg et eller flere familiemedlemmer. De får en notifikation om den nye opgave."
        },
        {
          q: "Kan jeg sætte deadlines og gentagende opgaver?",
          a: "Ja! Alle opgaver kan have en deadline. Du kan også sætte gentagelser (dagligt, ugentligt, månedligt eller custom). Opgaven oprettes automatisk igen når den markeres som færdig."
        }
      ]
    },
    {
      category: "Familie & Roller",
      questions: [
        {
          q: "Hvor mange familiemedlemmer kan jeg have?",
          a: "En familie kan have ubegrænset antal medlemmer. Ét abonnement dækker hele familien, uanset størrelse."
        },
        {
          q: "Hvad er forskellen på admin, voksen og barn roller?",
          a: "Admin kan slette familien og administrere alle medlemmer. Voksne kan se 'voksen' lister og administrere familie indstillinger. Børn har begrænset adgang og kan ikke se voksen-lister eller slette familie data."
        },
        {
          q: "Kan børn bruge NestList?",
          a: "Ja! NestList er designet til hele familien. Forældre opretter profiler for deres børn (under 18), og børneprofiler har passende begrænsninger for at beskytte familie data."
        },
        {
          q: "Kan vi have flere familier på én konto?",
          a: "Hver bruger er tilknyttet én familie. Hvis du vil administrere flere familier (f.eks. din egen og dine forældres), skal du oprette separate konti. Kontakt support for særlige behov."
        }
      ]
    },
    {
      category: "Data & Sikkerhed",
      questions: [
        {
          q: "Er mine data sikre?",
          a: "Ja! Vi bruger branchen-standard sikkerhedsforanstaltninger: kryptering (HTTPS/TLS), hashed passwords, Row Level Security, regelmæssige backups og 24/7 sikkerhedsovervågning."
        },
        {
          q: "Hvor gemmes mine data?",
          a: "Alle data gemmes på sikre servere i Danmark. Vi overholder GDPR og danske databeskyttelseslove."
        },
        {
          q: "Kan I se mine private opgaver?",
          a: "Nej! Dine data er krypterede, og vi har ikke adgang til dit indhold. Kun dit familiemedlemmer kan se delte data, og private data forbliver private."
        },
        {
          q: "Hvad sker der med mine data hvis jeg sletter min konto?",
          a: "Vi gemmer dine data i 90 dage i tilfælde af at du ombestemmer dig. Efter 90 dage slettes alt permanent. Du kan også anmode om øjeblikkelig sletning."
        },
        {
          q: "Kan jeg eksportere mine data?",
          a: "Ja! Gå til Indstillinger → Data & Privatliv → Eksporter data. Du kan downloade alle dine data i JSON eller CSV format."
        },
        {
          q: "Bruger I mine data til reklamer?",
          a: "Nej! Vi sælger ALDRIG dine data og bruger dem ikke til reklamer. Dine familie data forbliver private."
        }
      ]
    },
    {
      category: "Teknisk Support",
      questions: [
        {
          q: "Hvilke browsere understøttes?",
          a: "NestList fungerer bedst i moderne browsere: Chrome, Firefox, Safari og Edge (alle seneste versioner). Vi anbefaler at holde din browser opdateret."
        },
        {
          q: "Kan jeg bruge NestList på min telefon?",
          a: "Ja! NestList er fuldt responsiv og fungerer perfekt på smartphones og tablets. Du kan også installere den som PWA for en app-lignende oplevelse."
        },
        {
          q: "Hvordan installerer jeg NestList som app?",
          a: "På iPhone/iPad: Åbn nestlist.dk i Safari → Tryk på del-knappen → 'Føj til hjemmeskærm'. På Android: Åbn i Chrome → Menu → 'Tilføj til startskærm'."
        },
        {
          q: "Jeg har glemt min adgangskode. Hvad gør jeg?",
          a: "Klik på 'Glemt adgangskode?' på login siden. Indtast din email, og vi sender dig et link til at nulstille din adgangskode."
        },
        {
          q: "Appen loader langsomt. Hvorfor?",
          a: "Første gang du bruger NestList kan det tage lidt tid at cachedata til offline brug. Efterfølgende vil den være meget hurtigere. Sørg også for en stabil internetforbindelse."
        },
        {
          q: "Hvem kontakter jeg hvis jeg har et problem?",
          a: "Send en email til support@nestlist.dk eller brug kontaktformularen. Vi svarer typisk inden for 24 timer på hverdage."
        }
      ]
    },
    {
      category: "Sammenligninger",
      questions: [
        {
          q: "Hvordan er NestList anderledes end Todoist eller Notion?",
          a: "NestList er specifikt designet til familier (ikke virksomheder eller single brugere). Vi har familie-specifikke funktioner som roller (voksen/barn), delte indkøbslister med automatisk kategorisering, og enkel UI der også børn kan bruge."
        },
        {
          q: "Er NestList billigere end konkurrenterne?",
          a: "Ja! Med 59 kr/måned for hele familien er NestList mere prisvenlig end Todoist (€6.99/bruger) eller Notion ($10/bruger). Derudover får du 60 dages gratis trial vs. 30 dage hos konkurrenterne."
        },
        {
          q: "Har NestList lige så mange funktioner som Notion?",
          a: "NestList fokuserer på det familier faktisk bruger: opgaver, lister, indkøb og samarbejde. Vi har ikke wiki, databaser eller project management funktioner som Notion - men det gør os også meget simplere at bruge!"
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
              <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Ofte stillede spørgsmål
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Hvordan kan vi
              <span className="block text-blue-600 dark:text-blue-400 mt-2">
                hjælpe dig?
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Find svar på de mest almindelige spørgsmål om NestList. Kan du ikke finde det du leder efter?
              Kontakt os gerne!
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto pt-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Søg efter spørgsmål..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {filteredCategories.length === 0 ? (
              <Card className="border-2">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Ingen spørgsmål matcher din søgning. Prøv andre søgeord eller kontakt os direkte.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/contact">
                      <Mail className="mr-2 h-4 w-4" />
                      Kontakt support
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredCategories.map((category, catIndex) => (
                <div key={catIndex} className="space-y-4">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {category.category}
                  </h2>

                  <div className="space-y-3">
                    {category.questions.map((item, qIndex) => {
                      const globalIndex = catIndex * 100 + qIndex;
                      const isOpen = openIndex === globalIndex;

                      return (
                        <Card key={qIndex} className="border-2 overflow-hidden">
                          <button
                            onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                            className="w-full p-6 text-left flex items-start justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex-1">
                              {item.q}
                            </h3>
                            <ChevronDown
                              className={`h-5 w-5 text-gray-500 flex-shrink-0 transition-transform ${
                                isOpen ? "transform rotate-180" : ""
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <CardContent className="px-6 pb-6 pt-0">
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {item.a}
                              </p>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Fandt du ikke svar på dit spørgsmål?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Vores support team er klar til at hjælpe dig. Send os en besked, så vender vi tilbage inden for 24 timer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">
                  <Mail className="mr-2 h-5 w-5" />
                  Kontakt support
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/help">
                  Besøg hjælpecenter
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
              Klar til at prøve NestList?
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
