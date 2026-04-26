import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fauna",
    template: "%s | Fauna",
  },
  description:
    "Turn wildlife into a real-life game. Photograph animals in the wild, log them to your field, score by rarity, and compete with friends without counting zoo captures.",
};

export const viewport = {
  themeColor: "#10263a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=erode@300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
