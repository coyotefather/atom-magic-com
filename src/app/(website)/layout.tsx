import type { Metadata } from "next";
import { Marcellus_SC, Noto_Serif } from "next/font/google";
import localFont from 'next/font/local'
import "../globals.css";
import StoreProvider from "@/app/StoreProvider";
import HeroProvider from "@/app/HeroProvider";
import { ThemeProvider } from "@/lib/ThemeContext";
import { RollProvider } from "@/lib/RollContext";
import { OfflineProvider } from "@/lib/OfflineContext";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import NavBar from '@/app/components/global/NavBar';
import Footer from '@/app/components/global/Footer';
import ErrorBoundary from '@/app/components/common/ErrorBoundary';

const marcellus = Marcellus_SC({
  weight: ['400'],
  variable: '--font-marcellus',
  subsets: ["latin"] });
// const inconsolata = Inconsolata({
//   weight: ['200', '300', '400', '500', '600', '700', '800'],
//   variable: '--font-inconsolata',
//   subsets: ["latin"] });

const noto_serif = Noto_Serif({
  variable: '--font-notoserif',
  subsets: ["latin"] });

const lapideum = localFont({ src: '../../fonts/lapideum-2022-v1.woff', variable: '--font-lapideum' })

export const metadata: Metadata = {
  title: "Atom Magic Tools",
  description: "Create and Manage characters, play Vorago, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${marcellus.variable} ${lapideum.variable} ${noto_serif.variable} flex flex-col h-screen`}>
        <ThemeProvider>
          <OfflineProvider>
            <RollProvider>
              <NavBar />
              <div className="grow">
                <ErrorBoundary>
                  <HeroProvider>
                    <StoreProvider>{children}</StoreProvider>
                  </HeroProvider>
                </ErrorBoundary>
              </div>
              <Footer />
            </RollProvider>
          </OfflineProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
