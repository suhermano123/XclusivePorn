import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "novapornx - Premium Adult Videos for Free (novaporn) | HD Content",
  description: "Welcome to novapornx! Enjoy premium adult videos in high quality, free of charge, with fast download options. Explore exclusive HD content on novaporn today.",
  keywords: "novaporn, novapornx, free porn, adult videos, hd porn, premium adult content",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/assets/logo.png', type: 'image/png' }
    ],
    apple: [
      { url: '/assets/logo.png', type: 'image/png' }
    ]
  }
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
