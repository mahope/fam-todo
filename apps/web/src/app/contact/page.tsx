"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  Send,
  Phone,
  MapPin
} from "lucide-react";

export default function ContactPage() {
  const { data: session, status } = useSession();
  const isPending = status === "loading";
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (session?.user && !isPending) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

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
              <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Kontakt os
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Vi er her for at
              <span className="block text-blue-600 dark:text-blue-400 mt-2">
                hjælpe dig
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Har du spørgsmål eller brug for hjælp? Send os en besked, så vender vi tilbage
              hurtigst muligt - normalt inden for 24 timer.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Info Cards */}
              <div className="space-y-6">
                <Card className="border-2">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        Email
                      </h3>
                      <a
                        href="mailto:support@nestlist.dk"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        support@nestlist.dk
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        Svartid
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Normalt inden for 24 timer på hverdage
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        Placering
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Udviklet i Danmark
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-2">
                  <CardContent className="p-8">
                    {isSubmitted ? (
                      <div className="text-center py-12 space-y-4">
                        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Tak for din besked!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Vi har modtaget din henvendelse og vender tilbage hurtigst muligt.
                        </p>
                        <Button
                          onClick={() => setIsSubmitted(false)}
                          variant="outline"
                          className="mt-4"
                        >
                          Send endnu en besked
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                          Send os en besked
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label
                                htmlFor="name"
                                className="text-sm font-medium text-gray-900 dark:text-white"
                              >
                                Navn *
                              </label>
                              <Input
                                id="name"
                                name="name"
                                required
                                placeholder="Dit fulde navn"
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="email"
                                className="text-sm font-medium text-gray-900 dark:text-white"
                              >
                                Email *
                              </label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="din@email.dk"
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="subject"
                              className="text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Emne *
                            </label>
                            <Input
                              id="subject"
                              name="subject"
                              required
                              placeholder="Hvad drejer din henvendelse sig om?"
                              disabled={isSubmitting}
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="message"
                              className="text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Besked *
                            </label>
                            <Textarea
                              id="message"
                              name="message"
                              required
                              rows={6}
                              placeholder="Beskriv din henvendelse så detaljeret som muligt..."
                              disabled={isSubmitting}
                              className="resize-none"
                            />
                          </div>

                          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Vi behandler dine personlige oplysninger fortroligt i overensstemmelse
                              med GDPR. Vi bruger kun din email til at besvare din henvendelse.
                            </p>
                          </div>

                          <Button
                            type="submit"
                            size="lg"
                            className="w-full sm:w-auto"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Sender...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Send besked
                              </>
                            )}
                          </Button>
                        </form>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Hurtige svar
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Måske finder du svaret på dit spørgsmål her
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Hvordan kommer jeg i gang med NestList?",
                  a: "Klik på 'Start 60 dages gratis trial' knappen øverst på siden. Du opretter en konto, inviterer din familie, og kan straks begynde at oprette lister og opgaver. Ingen kreditkort påkrævet!"
                },
                {
                  q: "Kan jeg få hjælp til at sætte NestList op til min familie?",
                  a: "Selvfølgelig! Send os en besked via kontaktformularen ovenfor, så hjælper vi dig i gang. Vi kan også lave en kort video-gennemgang hvis det hjælper."
                },
                {
                  q: "Hvad hvis jeg har tekniske problemer?",
                  a: "Send os en email på support@nestlist.dk med en beskrivelse af problemet, gerne med skærmbilleder. Vi svarer typisk inden for 24 timer på hverdage."
                },
                {
                  q: "Kan jeg få en refundering hvis NestList ikke passer til os?",
                  a: "Ja! Vi har 60 dages pengene tilbage garanti. Hvis du ikke er tilfreds, får du dine penge tilbage - ingen spørgsmål stillet."
                },
                {
                  q: "Tilbyder I support på dansk?",
                  a: "Ja, al vores support er på dansk. Vi er et dansk team der forstår danske familiers behov."
                }
              ].map((item, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      {item.q}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.a}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
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
