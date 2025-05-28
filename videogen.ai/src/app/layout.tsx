import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Adjust path if necessary

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
      <body className={`${inter.className} bg-gray-900`}> {/* Added bg-gray-900 for consistent background */}
        <Navbar />
        <main>{children}</main>
        {/* You might want to add a Footer component here later */}
      </body>
    </html>
  );
}
