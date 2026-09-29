import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-fraunces", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

const SITE_URL = "https://destiny-site-omega.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Destiny Events and Photography",
    template: "%s | Destiny Events and Photography",
  },
  description:
    "Destiny Events and Photography — wedding photography, wedding films, event photography and cinematic films from Bengaluru. The next generation of Swaroop Studios, since 1972.",
  applicationName: "Destiny Events and Photography",
  keywords: [
    "Destiny Events and Photography",
    "Destiny Events & Photography",
    "Destiny Events Photography",
    "wedding photography Bengaluru",
    "wedding photography Bangalore",
    "wedding films Bengaluru",
    "event photography Bengaluru",
    "Swaroop Studios",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Destiny Events and Photography",
    title: "Destiny Events and Photography",
    description: "Wedding photography, wedding films, event photography and cinematic films from Bengaluru.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Destiny Events and Photography",
    description: "Wedding photography, wedding films, event photography and cinematic films from Bengaluru.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0B0C",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": SITE_URL + "/#organization",
  name: "Destiny Events and Photography",
  alternateName: ["Destiny", "Destiny Events + Photography", "Destiny Events & Photography"],
  url: SITE_URL,
  email: "destinyeventsandphotography@gmail.com",
  sameAs: ["https://www.instagram.com/destinyeventsandphotography/"],
  description: "Destiny Events and Photography is a photography and filmmaking studio for weddings, events, corporate and brand productions.",
  foundingDate: "1972",
  brand: { "@type": "Brand", name: "Destiny Events and Photography" },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": SITE_URL + "/#website",
  url: SITE_URL,
  name: "Destiny Events and Photography",
  alternateName: ["Destiny", "Destiny Events + Photography"],
  publisher: { "@id": SITE_URL + "/#organization" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${fraunces.variable} ${manrope.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body className="bg-bg font-body text-paper antialiased">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}