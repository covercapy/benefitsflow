import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BenefitsFlow HRIS Lab",
  description: "Workday-inspired HR Benefits enrollment and management simulation. Fictional data only.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
