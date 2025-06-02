import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Adjust path if necessary
import Footer from "@/components/Footer"; // Import the Footer component
import Providers from "./providers"; // Import the new Providers component

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" }); // Add Lexend

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
    <html lang="en" className="h-full"> {/* Ensure html takes full height */}
      <body className={`${inter.variable} ${lexend.variable} font-sans bg-background text-foreground flex flex-col min-h-full`}> {/* Apply Inter and Lexend variables, and default font, bg, text */}
        <Providers> {/* Wrap Navbar and children with Providers */}
          <Navbar />
          <main className="flex-grow">{children}</main> {/* Allow main content to grow */}
          <Footer /> {/* Add the Footer component here */}
        </Providers>
      </body>
    </html>
  );
}
