import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AppHeader } from "@/components/layout/AppHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Greece Compliance — PEP & Adverse Media Screening",
  description:
    "Next-generation name screening for PEP and adverse media detection powered by Greece Compliance Intelligence",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="mesh-gradient min-h-screen">
            <AppHeader />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
