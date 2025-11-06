"use client";

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "NestList",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "DKK"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "ratingCount": "500",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": "Hold din familie organiseret med NestList. Smart opgavestyring, indkøbslister og koordinering for hele familien. Gratis, nemt og sikkert.",
    "featureList": [
      "Familie samarbejde og deling",
      "Smart indkøbsliste med kategorisering",
      "Opgave kalender med deadlines",
      "Offline support",
      "Push notifikationer",
      "Private og delte lister",
      "Realtids synkronisering"
    ],
    "screenshot": "/og-image.png",
    "author": {
      "@type": "Organization",
      "name": "NestList"
    }
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "NestList",
    "description": "Den komplette familieorganisator for opgaver, indkøbslister og daglige gøremål.",
    "url": typeof window !== 'undefined' ? window.location.origin : '',
    "logo": "/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@nestlist.dk",
      "contactType": "Customer Support",
      "availableLanguage": ["Danish"]
    }
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Er NestList virkelig gratis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja! NestList er 100% gratis at bruge for familier. Der er ingen skjulte gebyrer, ingen betalingsmure, og du behøver ikke et kreditkort for at komme i gang."
        }
      },
      {
        "@type": "Question",
        "name": "Kan jeg bruge NestList på både telefon og computer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolut! NestList virker på alle enheder - smartphones, tablets og computere. Alt synkroniseres automatisk i realtid."
        }
      },
      {
        "@type": "Question",
        "name": "Er mine familiedata sikre og private?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, sikkerhed og privatliv er vores højeste prioritet. Dine data er krypteret, og kun medlemmer af din familie har adgang til jeres information. Vi følger alle GDPR-retningslinjer."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  );
}
