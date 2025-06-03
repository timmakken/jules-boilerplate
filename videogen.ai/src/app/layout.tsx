import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Adjust path if necessary
import Footer from "@/components/Footer"; // Import the Footer component
import Providers from "./providers"; // Import the new Providers component

// Load fonts with subsets
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

const lexend = Lexend({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-lexend'
});

export const metadata: Metadata = {
  title: {
    default: 'Videogen.ai - AI Video Generation Platform',
    template: '%s | Videogen.ai',
  },
  description: "Videogen.ai is your AI-powered platform to effortlessly create professional videos from text, customize templates, and utilize realistic voice cloning. Sign up free!",
  // Consider adding other global metadata here, e.g., icons, openGraph defaults
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <body className="bg-background text-foreground flex flex-col min-h-screen">
        <Providers>
          <Navbar />
          <main className="flex-grow pt-16 md:pt-20">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
