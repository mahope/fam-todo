"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  BookOpen,
  Search,
  PlayCircle,
  FileText,
  MessageCircle,
  Rocket,
  ListTodo,
  ShoppingCart,
  Users,
  Settings,
  HelpCircle,
  ExternalLink,
  Mail
} from "lucide-react";

export default function HelpPage() {
  const { data: session, status } = useSession();
  const isPending = status === "loading";
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

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

  const helpCategories = [
    {
      icon: Rocket,
      title: "Kom i gang",
      description: "Lær det grundlæggende og kom hurtigt i gang med NestList",
      color: "blue",
      articles: [
        { title: "Opret din første konto", url: "/help/getting-started/create-account" },
        { title: "Opret og administrer din familie", url: "/help/getting-started/create-family" },
        { title: "Inviter familiemedlemmer", url: "/help/getting-started/invite-members" },
        { title: "Installer NestList som app på din telefon", url: "/help/getting-started/install-pwa" },
        { title: "Kom i gang på 5 minutter (video)", url: "/help/getting-started/quick-start" }
      ]
    },
    {
      icon: ListTodo,
      title: "Opgaver og lister",
      description: "Alt om at oprette og administrere opgaver og lister",
      color: "green",
      articles: [
        { title: "Opret din første liste", url: "/help/tasks/create-list" },
        { title: "Tilføj opgaver med deadlines", url: "/help/tasks/add-tasks" },
        { title: "Tildel opgaver til familiemedlemmer", url: "/help/tasks/assign-tasks" },
        { title: "Brug tilbagevendende opgaver", url: "/help/tasks/recurring-tasks" },
        { title: "Organiser med mapper", url: "/help/tasks/folders" },
        { title: "Brug tags til bedre organisering", url: "/help/tasks/tags" },
        { title: "Forstå synlighedskontrol (privat/familie/voksne)", url: "/help/tasks/visibility" }
      ]
    },
    {
      icon: ShoppingCart,
      title: "Indkøbslister",
      description: "Sådan bruger du den smarte indkøbsliste funktion",
      color: "purple",
      articles: [
        { title: "Opret en indkøbsliste", url: "/help/shopping/create-list" },
        { title: "Tilføj varer med autocomplete", url: "/help/shopping/add-items" },
        { title: "Forstå automatisk kategorisering", url: "/help/shopping/categories" },
        { title: "Del indkøbslisten med familien", url: "/help/shopping/share" },
        { title: "Marker varer som købt", url: "/help/shopping/mark-purchased" }
      ]
    },
    {
      icon: Users,
      title: "Familie administration",
      description: "Administrer familiemedlemmer og roller",
      color: "orange",
      articles: [
        { title: "Forstå roller (admin, voksen, barn)", url: "/help/family/roles" },
        { title: "Administrer familiemedlemmer", url: "/help/family/manage-members" },
        { title: "Fjern familiemedlemmer", url: "/help/family/remove-members" },
        { title: "Overfør admin rettigheder", url: "/help/family/transfer-admin" },
        { title: "Opret børneprofiler", url: "/help/family/child-profiles" }
      ]
    },
    {
      icon: Settings,
      title: "Indstillinger og konto",
      description: "Administrer din konto, profil og indstillinger",
      color: "pink",
      articles: [
        { title: "Skift adgangskode", url: "/help/account/change-password" },
        { title: "Opdater profilbillede", url: "/help/account/profile-picture" },
        { title: "Administrer notifikationer", url: "/help/account/notifications" },
        { title: "Skift tema (lys/mørk)", url: "/help/account/theme" },
        { title: "Eksporter dine data", url: "/help/account/export-data" },
        { title: "Slet din konto", url: "/help/account/delete-account" },
        { title: "Administrer abonnement", url: "/help/account/subscription" },
        { title: "Annuller abonnement", url: "/help/account/cancel-subscription" }
      ]
    },
    {
      icon: HelpCircle,
      title: "Teknisk support",
      description: "Løs tekniske problemer og fejlfinding",
      color: "red",
      articles: [
        { title: "NestList loader langsomt", url: "/help/troubleshooting/slow-loading" },
        { title: "Kan ikke logge ind", url: "/help/troubleshooting/login-issues" },
        { title: "Offline funktionalitet virker ikke", url: "/help/troubleshooting/offline-issues" },
        { title: "Notifikationer virker ikke", url: "/help/troubleshooting/notification-issues" },
        { title: "Gendan glemt adgangskode", url: "/help/troubleshooting/forgot-password" },
        { title: "Synkroniseringsproblemer", url: "/help/troubleshooting/sync-issues" },
        { title: "Understøttede browsere", url: "/help/troubleshooting/supported-browsers" }
      ]
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

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    articles: category.articles.filter(
      article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0 || searchQuery === "");

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
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Hjælpecenter
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Hvordan kan vi
              <span className="block text-blue-600 dark:text-blue-400 mt-2">
                hjælpe dig?
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Søg i vores hjælpeartikler eller gennemse kategorier nedenfor for at finde svar
              på dine spørgsmål.
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto pt-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Søg efter hjælpeartikler..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-4">
              <Button variant="outline" size="lg" className="h-auto py-4" asChild>
                <Link href="/how-it-works">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Kom i gang guide
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-auto py-4" asChild>
                <Link href="/faq">
                  <FileText className="mr-2 h-5 w-5" />
                  Se FAQ
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-auto py-4" asChild>
                <Link href="/contact">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Kontakt support
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {searchQuery && filteredCategories.length === 0 ? (
              <Card className="border-2">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Ingen artikler matcher din søgning. Prøv andre søgeord eller kontakt support direkte.
                  </p>
                  <Button asChild>
                    <Link href="/contact">
                      <Mail className="mr-2 h-4 w-4" />
                      Kontakt support
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category, index) => {
                  const colors = colorMap[category.color as keyof typeof colorMap];

                  return (
                    <Card key={index} className={`border-2 ${colors.border} hover:shadow-lg transition-all`}>
                      <CardContent className="p-6 space-y-4">
                        <div className={`${colors.bg} ${colors.text} h-14 w-14 rounded-xl flex items-center justify-center`}>
                          <category.icon className="h-7 w-7" />
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {category.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {category.description}
                          </p>
                        </div>

                        <ul className="space-y-2 pt-2">
                          {category.articles.slice(0, 5).map((article, aIndex) => (
                            <li key={aIndex}>
                              <a
                                href={article.url}
                                className={`text-sm ${colors.text} hover:underline flex items-center gap-2 group`}
                              >
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                {article.title}
                              </a>
                            </li>
                          ))}
                        </ul>

                        {category.articles.length > 5 && (
                          <Button variant="ghost" size="sm" className={`w-full ${colors.text}`}>
                            Se alle {category.articles.length} artikler
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Populære artikler
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                De mest læste guides og tutorials
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "Kom i gang på 5 minutter", icon: Rocket, url: "/help/getting-started/quick-start" },
                { title: "Opret din første indkøbsliste", icon: ShoppingCart, url: "/help/shopping/create-list" },
                { title: "Inviter familiemedlemmer", icon: Users, url: "/help/getting-started/invite-members" },
                { title: "Installer som app på telefon", icon: Settings, url: "/help/getting-started/install-pwa" },
                { title: "Forstå synlighedskontrol", icon: ListTodo, url: "/help/tasks/visibility" },
                { title: "Administrer notifikationer", icon: HelpCircle, url: "/help/account/notifications" }
              ].map((article, index) => (
                <a
                  key={index}
                  href={article.url}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-all hover:shadow-md group"
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <article.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {article.title}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Still need help CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Fandt du ikke det du ledte efter?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Vores support team er klar til at hjælpe dig. Vi svarer typisk inden for 24 timer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">
                  <Mail className="mr-2 h-5 w-5" />
                  Kontakt support
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/faq">
                  Se FAQ
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
              Start din 60 dages gratis prøveperiode i dag.
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
