import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import Script from "next/script";
import { getPayload } from "payload";
import configPromise from "@/payload.config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pixels Digital - Creating Top Digital Solutions",
  description: "We are a passionate team of digital experts dedicated to helping businesses thrive online. Services include Web Development & Video Content Creation.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const payload = await getPayload({ config: configPromise });
  let navbarData = null;
  try {
    navbarData = await payload.findGlobal({ slug: 'navbar', depth: 1 });
  } catch (e) {
    // Fail silently if not found yet
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <Navbar data={navbarData} />
          {children}
          <Footer />
          {/* Cashfree Checkout Script */}
          <Script 
            src="https://sdk.cashfree.com/js/v3/cashfree.js"
            strategy="lazyOnload"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
