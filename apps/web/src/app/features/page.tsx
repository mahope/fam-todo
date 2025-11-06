"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Users,
  ShoppingCart,
  Calendar,
  Lock,
  Wifi,
  Bell,
  Smartphone,
  FolderTree,
  Tag,
  Clock,
  Share2,
  Zap,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function FeaturesPage() {
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

  const features = [
    {
      icon: Users,
      title: "Familie Samarbejde",
      description: "Del opgaver og lister med hele familien. Alle kan se og opdatere i realtid.",
      details: "NestList er designet fra bunden til familie samarbejde. Opret en familie, inviter medlemmer, og alle kan straks se hinandens opgaver og lister. Real-time synkronisering betyder at når ét familiemedlem markerer en opgave som færdig, ser alle andre det øjeblikkeligt - uanset hvilken enhed de bruger.",
      benefits: [
        "Real-time opdateringer på tværs af alle enheder",
        "Ubegrænset antal familiemedlemmer",
        "Rolle-baseret adgang (admin, voksen, barn)",
        "Se hvem der er ansvarlig for hver opgave"
      ],
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      icon: ShoppingCart,
      title: "Smart Indkøbsliste",
      description: "Automatisk kategorisering af varer og intelligent autocomplete for hurtigere tilføjelse.",
      details: "Glem papir indkøbssedler! NestList's smarte indkøbsliste lærer hvad du køber og foreslår automatisk kategorier (mejeriprodukter, frugt & grønt osv.). Med autocomplete kan du nemt finde varer du har købt før. Marker varer som købt uden at slette dem - perfekt hvis du køber de samme ting hver uge.",
      benefits: [
        "Automatisk kategorisering af produkter",
        "Autocomplete baseret på tidligere indkøb",
        "Del indkøbslisten med hele familien",
        "Marker varer som købt uden at slette dem",
        "Se historik over tidligere indkøb"
      ],
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      icon: Calendar,
      title: "Opgave Kalender",
      description: "Visualiser alle opgaver i en kalendervisning med deadlines og tilbagevendende opgaver.",
      details: "Se alle familiens opgaver i en overskuelig kalendervisning. Deadlines vises tydeligt, og du kan nemt se hvem der skal gøre hvad og hvornår. Drag & drop opgaver for at ændre deadlines, og få overblik over både dagens, ugens og månedens opgaver på ét blik.",
      benefits: [
        "Visuel oversigt over alle opgaver",
        "Drag & drop for at ændre deadlines",
        "Farvekodet efter ansvarlig person",
        "Filtrering efter familiemedlem",
        "Integration med tilbagevendende opgaver"
      ],
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    },
    {
      icon: Lock,
      title: "Private & Delte Lister",
      description: "Opret private lister eller del dem med hele familien eller kun voksne.",
      details: "Fuld kontrol over hvem der kan se hvad. Opret private lister til dine egne noter, familie lister som alle kan se, eller voksen lister til ting som børnene ikke skal se (f.eks. julegaver). Synligheden kan ændres når som helst.",
      benefits: [
        "3 synlighedsniveauer: Privat, Familie, Voksne",
        "Beskyt følsomme oplysninger fra børn",
        "Hvert familiemedlem kan have private noter",
        "Nem deling med et klik"
      ],
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20"
    },
    {
      icon: Wifi,
      title: "Offline Tilgængelig",
      description: "Arbejd videre selv uden internet. Alle ændringer synkroniseres automatisk.",
      details: "NestList er en PWA (Progressive Web App) med fuld offline support. Dine data caches lokalt, så du kan se og redigere opgaver selv i flyvemaskinen eller i kælderen uden WiFi. Når du kommer online igen, synkroniseres alt automatisk - ingen dataens tabt!",
      benefits: [
        "Fuld funktionalitet uden internet",
        "Automatisk synkronisering når du kommer online",
        "Caching af alle dine data",
        "Ingen bekymringer om dårlig forbindelse"
      ],
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/20"
    },
    {
      icon: Bell,
      title: "Push Notifikationer",
      description: "Bliv notificeret om nye opgaver, deadlines og vigtige opdateringer.",
      details: "Glem aldrig en opgave igen! NestList sender push notifikationer direkte til din telefon eller desktop når deadlines nærmer sig, når du bliver tildelt nye opgaver, eller når familiemedlemmer kommenterer på delte opgaver. Fuld kontrol over hvilke notifikationer du vil modtage.",
      benefits: [
        "Påmindelser om kommende deadlines",
        "Notifikationer om nye tildelinger",
        "Real-time opdateringer fra familien",
        "Tilpasselige notifikationsindstillinger",
        "Fungerer på både mobil og desktop"
      ],
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20"
    },
    {
      icon: Smartphone,
      title: "Mobil-Først Design",
      description: "Optimeret til mobil brug med nem navigation og hurtige handlinger.",
      details: "De fleste opgaver sker på farten - derfor er NestList designet mobil-først. Nem navigation med bundmenu, floating action button til hurtige opgaver, og swipe gestures for almindelige handlinger. Naturligvis fungerer det også perfekt på tablet og desktop!",
      benefits: [
        "Intuitiv mobil navigation",
        "Hurtige handlinger med swipe og tap",
        "Responsive design til alle skærmstørrelser",
        "Touch-optimeret UI",
        "Installer som app på din telefon"
      ],
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20"
    },
    {
      icon: FolderTree,
      title: "Mapper & Organisering",
      description: "Organiser dine lister i mapper med farver for bedre overblik.",
      details: "Hold styr på mange lister ved at gruppere dem i mapper. Opret f.eks. en 'Hus' mappe med lister for rengøring, vedligeholdelse og projekter. Hver mappe kan farvemarkeres for hurtig identifikation, og du kan nemt se hvor mange opgaver der er i hver.",
      benefits: [
        "Ubegrænsede mapper og undermappe",
        "Farvemarkering for hurtig identifikation",
        "Synlighedskontrol også for mapper",
        "Drag & drop organisering",
        "Se total antal opgaver pr. mappe"
      ],
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20"
    },
    {
      icon: Tag,
      title: "Tags & Kategorier",
      description: "Tag opgaver og find dem nemt igen med kraftfuld søgning.",
      details: "Tilføj tags til opgaver for bedre organisering på tværs af lister. Søg efter #vigtig, #hurtigt eller #weekend for at finde alle relevante opgaver uanset hvilken liste de er i. Tags er også nyttige til at gruppere relaterede opgaver fra forskellige lister.",
      benefits: [
        "Ubegrænset antal custom tags",
        "Søg på tværs af alle lister",
        "Filtrer opgaver efter tags",
        "Farvekodede tags",
        "Se populære tags med autocomplete"
      ],
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-100 dark:bg-pink-900/20"
    },
    {
      icon: Clock,
      title: "Tilbagevendende Opgaver",
      description: "Opsæt daglige, ugentlige eller månedlige gentagne opgaver automatisk.",
      details: "Nogle opgaver skal gentages - som at tømme opvaskemaskinen eller klip græsset. Med tilbagevendende opgaver opretter NestList automatisk en ny opgave når du markerer den nuværende som færdig. Vælg mellem dagligt, ugentligt, månedligt eller opret din egen custom schedule.",
      benefits: [
        "Daglige, ugentlige, månedlige gentagelser",
        "Custom gentagelsesmønstre",
        "Automatisk oprettelse af næste opgave",
        "Se historik over tidligere gentagelser",
        "Pause gentagelser midlertidigt"
      ],
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-100 dark:bg-teal-900/20"
    },
    {
      icon: Share2,
      title: "Aktivitetslog",
      description: "Se hvem der gjorde hvad og hvornår i en detaljeret historik.",
      details: "Få fuld gennemsigtighed med aktivitetslogen. Se hvem der oprettede, redigerede eller fuldførte opgaver. Perfekt til at holde styr på familiens fremskridt og se hvem der bidrog til hvad. Aktivitetslogen er også nyttig hvis noget ved en fejl blev slettet.",
      benefits: [
        "Detaljeret historik over alle handlinger",
        "Se hvem der gjorde hvad og hvornår",
        "Filtrering efter bruger eller aktivitet",
        "Nyttig til at finde slettede opgaver",
        "Eksporter aktivitetslog"
      ],
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-100 dark:bg-violet-900/20"
    },
    {
      icon: Zap,
      title: "Hurtig & Responsiv",
      description: "Lynhurtig app bygget med moderne teknologi for den bedste oplevelse.",
      details: "NestList er bygget med Next.js 15, React 19 og moderne web teknologi for maksimal performance. Real-time updates via WebSockets, optimistic UI opdateringer, og intelligent caching betyder at appen føles øjeblikkeligt responsiv - uanset om du er på WiFi eller mobildata.",
      benefits: [
        "Lynhurtig indlæsning (< 1 sekund)",
        "Real-time synkronisering",
        "Optimistic UI for øjeblikkelig feedback",
        "Intelligent caching og prefetching",
        "Bygget med moderne best practices"
      ],
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/20"
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

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Funktioner
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Alt du behøver for at
              <span className="block text-blue-600 dark:text-blue-400 mt-2">
                organisere familielivet
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              NestList er pakket med funktioner designet specifikt til familier.
              Fra smarte indkøbslister til samarbejdsopgaver - vi har tænkt på alt.
            </p>
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-20">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className={`inline-flex items-center gap-3 ${feature.bgColor} ${feature.color} px-4 py-2 rounded-full`}>
                    <feature.icon className="h-5 w-5" />
                    <span className="font-semibold">{feature.title}</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    {feature.description}
                  </h2>

                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.details}
                  </p>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Fordele:
                    </h3>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, bIndex) => (
                        <li key={bIndex} className="flex items-start gap-3">
                          <CheckCircle2 className={`h-5 w-5 ${feature.color} flex-shrink-0 mt-0.5`} />
                          <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Visual Placeholder */}
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <Card className="border-2">
                    <CardContent className="p-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                      <div className="aspect-square flex items-center justify-center">
                        <div className={`${feature.bgColor} ${feature.color} h-32 w-32 rounded-3xl flex items-center justify-center`}>
                          <feature.icon className="h-16 w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                ... og meget mere!
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Vi tilføjer løbende nye funktioner baseret på feedback fra rigtige familier.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                "Data eksport (JSON/CSV)",
                "Tema skift (lys/mørk)",
                "Profilbilleder",
                "Kommentarer på opgaver",
                "Undertasks (checklists)",
                "Global søgning",
                "Drag & drop sortering",
                "Arkivering af færdige opgaver",
                "GDPR compliant",
                "Dansk support",
                "99.9% oppetid",
                "Regelmæssige backups"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="text-gray-900 dark:text-white font-medium">{item}</span>
                </div>
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
              Klar til at prøve alle funktionerne?
            </h2>
            <p className="text-xl text-blue-50">
              Start din 60 dages gratis prøveperiode og oplev alle funktioner uden begrænsninger.
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
