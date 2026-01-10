import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FireWatch | Almora Forest Fire Prediction",
  description: "AI-powered forest fire prediction and monitoring system for the Almora region, Uttarakhand",
  keywords: ["forest fire", "prediction", "almora", "AI", "machine learning", "fire monitoring"],
  authors: [{ name: "FireWatch Team" }],
  openGraph: {
    title: "FireWatch | Almora Forest Fire Prediction",
    description: "AI-powered forest fire prediction and monitoring system",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-100`}>
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
