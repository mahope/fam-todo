"use client";

import { LandingHeader } from "./landing-header";
import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { BenefitsSection } from "./benefits-section";
import { HowItWorksSection } from "./how-it-works-section";
import { TestimonialsSection } from "./testimonials-section";
import { FAQSection } from "./faq-section";
import { CTASection } from "./cta-section";
import { LandingFooter } from "./landing-footer";
import { StructuredData } from "./structured-data";

export function LandingPage() {
  return (
    <>
      <StructuredData />
      <div className="flex flex-col min-h-screen">
        <LandingHeader />
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
        <LandingFooter />
      </div>
    </>
  );
}
