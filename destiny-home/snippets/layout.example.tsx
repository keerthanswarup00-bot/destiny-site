import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-fraunces", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "Destiny — Events + Photography",
  description: "Weddings, events, corporate and product photography & film. The next generation of Swaroop Studios, since 1972.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0B0C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="bg-bg font-body text-paper antialiased">
        <Nav />
        {/* Home starts under the fixed nav (hero is full-bleed). Every OTHER page should wrap its content in <div className="pt-16"> */}
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
