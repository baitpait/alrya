import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "استوديو الراية",
    template: "%s | استوديو الراية",
  },
  description: "استوديو الراية — علامة الجودة والاحتراف · حجز مناسبات وتصوير",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#4A0404" />
      </head>
      <body className={`${cairo.variable} site-body`}>{children}</body>
    </html>
  );
}
