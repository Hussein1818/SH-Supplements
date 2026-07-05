import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/src/lib/utils";
import Navbar from "@/src/components/Navbar";
import AppInitializer from "@/src/components/auth/AppInitializer";
import { Toaster } from "sonner";
import { Footer } from "../components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SH Supplements — Premium Performance Nutrition",
    template: "%s | SH Supplements",
  },
  description:
    "Discover clinically formulated whey protein, creatine, vitamins, pre-workout and mass gainers. SH Supplements — precision nutrition for peak performance.",
  keywords: [
    "supplements",
    "whey protein",
    "creatine",
    "pre-workout",
    "vitamins",
    "mass gainer",
    "sports nutrition",
    "performance nutrition",
  ],
  authors: [{ name: "SH Supplements" }],
  creator: "SH Supplements",
  metadataBase: new URL("https://sh-supplements.runasp.net"),
  openGraph: {
    title: "SH Supplements — Premium Performance Nutrition",
    description:
      "Precision nutrition for peak performance. Shop whey protein, creatine, vitamins, pre-workout and more.",
    type: "website",
    locale: "en_US",
    siteName: "SH Supplements",
  },
  twitter: {
    card: "summary_large_image",
    title: "SH Supplements — Premium Performance Nutrition",
    description: "Precision nutrition for peak performance.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body
        className={cn(
          "antialiased bg-background text-foreground font-sans",
          "selection:bg-emerald-100 selection:text-emerald-900"
        )}
      >
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
              borderRadius: "12px",
            },
          }}
        />
        <AppInitializer>
          <Navbar />
          <main className="flex-1 min-h-[calc(100vh-64px)] px-4 sm:px-6 lg:px-8">
            {children}
          </main>
          <Footer />
        </AppInitializer>
      </body>
    </html>
  );
}
