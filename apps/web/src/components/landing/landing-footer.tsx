"use client";

import Link from "next/link";
import { ListTodo, Mail, MapPin, Phone, Heart } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <ListTodo className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">NestList</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Den komplette familie-organisator. Hold styr på opgaver, indkøbslister
              og familiens aktiviteter - alt på ét sted.
            </p>
            <div className="flex gap-3 pt-2">
              {/* Social media links would go here */}
            </div>
          </div>

          {/* Product column */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Produkt</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/register" className="hover:text-white hover:underline transition-colors">
                  Kom i gang
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white hover:underline transition-colors">
                  Log ind
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white hover:underline transition-colors">
                  Priser
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white hover:underline transition-colors">
                  Funktioner
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white hover:underline transition-colors">
                  Sådan virker det
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources column */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Resurser</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/faq" className="hover:text-white hover:underline transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:underline transition-colors">
                  Hjælp & Support
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:underline transition-colors">
                  Brugervejledning
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:underline transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white hover:underline transition-colors">
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Contact column */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Firma</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="hover:text-white hover:underline transition-colors">
                  Om os
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:underline transition-colors">
                  Kontakt os
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white hover:underline transition-colors">
                  Privatlivspolitik
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white hover:underline transition-colors">
                  Servicevilkår
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white hover:underline transition-colors">
                  Cookie Politik
                </Link>
              </li>
            </ul>

            <div className="pt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <a href="mailto:support@nestlist.dk" className="hover:text-white hover:underline transition-colors">
                  support@nestlist.dk
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <div className="text-center sm:text-left">
              <p>
                © {currentYear} NestList. Alle rettigheder forbeholdes.
              </p>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <span>Lavet med</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>i Danmark</span>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>60 dage gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Dansk Udviklet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Sikker & Privat</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
