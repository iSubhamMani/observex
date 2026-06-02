import type { Metadata } from "next";
import { Finlandica } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const font = Finlandica({
  variable: "--font-findalica",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Observex",
  description: "Intrusive Web Analytics for Websites",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${font.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
