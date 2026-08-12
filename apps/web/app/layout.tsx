import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "استوديو الراية",
  description: "منصة إدارة استوديو الراية",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#5955D1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
