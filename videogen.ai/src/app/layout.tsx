import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Adjust path if necessary
import Footer from "@/components/Footer"; // Import the Footer component
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
    <html lang="en" className="h-full"> {/* Ensure html takes full height */}
      <body className={`${inter.className} bg-gray-900 flex flex-col min-h-full`}> {/* Flex column and min height for sticky footer */}
        <Providers> {/* Wrap Navbar and children with Providers */}
          <Navbar />
          <main className="flex-grow">{children}</main> {/* Allow main content to grow */}
          <Footer /> {/* Add the Footer component here */}
        </Providers>
      </body>
    </html>
  );
}
