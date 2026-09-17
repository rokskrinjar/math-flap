import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Math Flap",
  description: "Solve quick arithmetic, fly through the correct answer, and climb the daily leaderboard.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
