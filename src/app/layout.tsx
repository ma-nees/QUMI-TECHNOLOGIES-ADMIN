import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QUMI Admin Dashboard",
  description: "Admin panel for QUMI Tech",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
