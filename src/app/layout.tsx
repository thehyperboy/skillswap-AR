import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-heading", weight: ["600", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: "SkillSwap AR - Local skill exchange",
  description:
    "Discover nearby teachers and learners, send requests, chat, and build SkillKarma.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#fffef7_0%,_#f4f8f9_45%,_#ecf5f8_100%)] text-slate-900">
        <div className="min-h-screen bg-gradient-to-b from-brand-soft via-[#f5f8fb] to-white">
          <SiteHeader />
          <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
            {children}
          </main>
          <SiteFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
