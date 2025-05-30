import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Adjust path if necessary
import Providers from "./providers"; // Import the new Providers component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "videogen.ai - AI Video Generation",
  description: "Create stunning videos with the power of AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900`}>
        <Providers> {/* Wrap Navbar and children with Providers */}
          <Navbar />
          <main>{children}</main>
          {/* You might want to add a Footer component here later */}
        </Providers>
      </body>
    </html>
  );
}
