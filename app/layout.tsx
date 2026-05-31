import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Hangout Bhopal | AI-Powered City Guide & Recommender",
  description: "Bored in Bhopal? Let AI suggest the perfect hangout spots based on your mood, company, budget, real-time weather, and travel times. Your premium hyperlocal city companion.",
  keywords: ["Bhopal", "Hangout Bhopal", "AI guide", "Madhya Pradesh tourism", "Lakes of Bhopal", "Bada Talaab", "places to visit in Bhopal"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0F0F1A] text-[#FFFFFF] font-sans antialiased selection:bg-[#FF6B35]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
