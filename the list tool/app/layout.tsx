import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kasona Ops - Admin",
  description: "CRM and operations workspace for Kasona."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
