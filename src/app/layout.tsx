import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Toaster } from "@/components/ui/sonner";
import { SupabaseSync } from "@/components/SupabaseSync";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { ClearAuthOnStartup } from "@/components/ClearAuthOnStartup";
import { GlobalErrorCatcher } from "@/components/GlobalErrorCatcher";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Prerna Silks | Luxury Indian Ethnic Wear",
  description: "Ultra-premium, rich Indian aesthetic sarees from Hubli, Karnataka.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, playfair.variable)}>
      <body className="font-sans antialiased bg-background text-foreground flex flex-col min-h-screen">
        <GlobalErrorCatcher />
        <ClearAuthOnStartup />
        <SupabaseSync />
        <AnnouncementBar />
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <FloatingWhatsApp />
        <Toaster />
      </body>
    </html>
  );
}
