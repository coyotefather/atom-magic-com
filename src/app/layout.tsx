import type { Metadata } from "next";
import { Roboto, Inconsolata, Marcellus_SC } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/app/StoreProvider";
import NavBar from '@/app/components/global/NavBar';
import Footer from '@/app/components/global/Footer';

const roboto = Roboto({
  weight: ['400', '700'],
  variable: '--font-roboto',
  subsets: ["latin"] });
const marcellus = Marcellus_SC({
  weight: ['400'],
  variable: '--font-marcellus',
  subsets: ["latin"] });
const inconsolata = Inconsolata({
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-inconsolata',
  subsets: ["latin"] });

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
    <html lang="en">
      <body className={`${roboto.variable} ${inconsolata.variable} ${marcellus.variable} flex flex-col h-screen`}>
        <NavBar />
        <div className="grow">
          <StoreProvider>{children}</StoreProvider>
        </div>
        <Footer />
      </body>
    </html>
  );
}
