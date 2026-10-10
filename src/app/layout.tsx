import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import AnalyticsEvents from "@/components/AnalyticsEvents";
import ConsentMode from "@/components/ConsentMode";
import PageViewTracker from "@/components/PageViewTracker";
import { absoluteUrl, siteConfig } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["600"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: {
    default: "Tenlo | Servicios, centros y recursos para familias en Madrid noroeste",
    template: "%s"
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.currentDomain),
  icons: {
    icon: [
      { url: "/brand/tenlo-isotipo-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/tenlo-isotipo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/tenlo-isotipo-512.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: [{ url: "/brand/tenlo-isotipo-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/brand/tenlo-isotipo-180.png", sizes: "180x180", type: "image/png" }]
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteConfig.currentDomain,
    siteName: siteConfig.name,
    title: "Tenlo | Servicios, centros y recursos para familias en Madrid noroeste",
    description: siteConfig.description,
    images: [{ url: "/brand/tenlo-isotipo-512.png", width: 512, height: 512, alt: "Tenlo" }]
  },
  twitter: {
    card: "summary",
    title: "Tenlo | Servicios, centros y recursos para familias en Madrid noroeste",
    description: siteConfig.description,
    images: ["/brand/tenlo-isotipo-512.png"]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const cookiebotId = process.env.NEXT_PUBLIC_COOKIEBOT_ID;
  const hasValidCookiebotId = Boolean(
    cookiebotId && !/^(tu-id|your-|example|placeholder)/i.test(cookiebotId)
  );
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.currentDomain}/#organization`,
    name: siteConfig.name,
    url: siteConfig.currentDomain,
    logo: absoluteUrl("/brand/tenlo-isotipo-512.png"),
    description: siteConfig.shortDescription,
    slogan: siteConfig.tagline,
    areaServed: siteConfig.municipalities.map((name) => ({
      "@type": "City",
      name
    })),
    sameAs: [siteConfig.social.instagram, siteConfig.social.linkedin],
    contactPoint: {
      "@type": "ContactPoint",
      url: absoluteUrl("/contacto"),
      contactType: "customer support",
      areaServed: "ES",
      availableLanguage: "es"
    }
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.currentDomain}/#website`,
    name: siteConfig.name,
    url: siteConfig.currentDomain,
    description: siteConfig.shortDescription,
    inLanguage: "es",
    publisher: {
      "@id": `${siteConfig.currentDomain}/#organization`
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.currentDomain}/buscar?tag={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="es">
      <head>
        {gtmId ? (
          <script
            id="gtm-consent-default"
            dangerouslySetInnerHTML={{
              __html: "window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};window.gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','functionality_storage':'granted','security_storage':'granted'});"
            }}
          />
        ) : null}
        {hasValidCookiebotId ? (
          <script
            id="Cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            data-cbid={cookiebotId}
            data-blockingmode="auto"
          />
        ) : null}
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <Header />
        <ConsentMode gtmId={gtmId} />
        <AnalyticsEvents />
        <PageViewTracker />
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
