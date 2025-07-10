import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "WeSend – SMS, Email, WhatsApp Marketing",
    template: "%s | WeSend",
  },
  description:
    "WeSend is your all-in-one platform for SMS, Email, WhatsApp & Telegram marketing. Reach your audience effectively and grow your business.",
  keywords: [
    "WeSend",
    "SMS Marketing",
    "WhatsApp Marketing",
    "Email Campaigns",
    "Telegram Notifications",
    "Bulk Messaging",
    "Next.js",
  ],
  authors: [
    {
      name: "WeTrainEducation & Tech OPC",
      url: "https://wetraineducation.com",
    },
  ],
  creator: "WeTrainEducation & Tech OPC",
  metadataBase: new URL("https://we-send.vercel.app"),
  openGraph: {
    title: "WeSend – Smart Multi-Channel Marketing",
    description:
      "Launch and manage SMS, WhatsApp, and Email campaigns with ease using WeSend.",
    url: "https://we-send.vercel.app",
    siteName: "WeSend",
    images: [
      {
        url: "/og-image.jpg", // ensure this image exists
        width: 1200,
        height: 630,
        alt: "WeSend Campaign Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WeSend – SMS, Email & WhatsApp Campaigns",
    description:
      "WeSend helps you launch powerful marketing campaigns effortlessly.",
    images: ["/og-image.jpg"],
    creator: "@WeTrainEDU",
  },
  themeColor: "#ffcc00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
