import type { Metadata } from "next";
import { Cabin, Cormorant_Garamond, Libre_Baskerville, Lora } from "next/font/google";

import "./globals.css";

const baskerville = Libre_Baskerville({
  variable: "--font-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const cabin = Cabin({
  variable: "--font-cabin",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "British Dictation Checker",
  description: "Spelling and transcription practice, marked to British standards.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${baskerville.variable} ${cabin.variable} ${lora.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="font-body text-ink flex min-h-full flex-col">{children}</body>
    </html>
  );
}
