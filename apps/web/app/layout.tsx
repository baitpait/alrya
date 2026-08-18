import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cairo } from "next/font/google";
import { THEME_STORAGE_KEY } from "@/components/admin/nav";
import { ThemeSync } from "@/components/admin/ThemeSync";
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jar = await cookies();
  const saved = jar.get(THEME_STORAGE_KEY)?.value;
  const theme = saved === "dark" ? "dark" : "light";

  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme={theme}
      className={`${cairo.variable} ${cairo.className}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#4A0404" />
      </head>
      <body className="site-body">
        <ThemeSync />
        {children}
      </body>
    </html>
  );
}
