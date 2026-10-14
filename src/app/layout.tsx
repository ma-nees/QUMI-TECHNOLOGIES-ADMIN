import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PWA } from "@/components/PWA";
import "./globals.css";

export const metadata: Metadata = {
  title: "QUMI Admin Dashboard",
  description: "Admin panel for QUMI Tech",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <PWA />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
