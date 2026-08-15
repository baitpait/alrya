import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { THEME_STORAGE_KEY } from "@/components/admin/nav";
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

const themeBootScript = `(function(){try{if(location.pathname.indexOf("/admin")!==0)return;var k=${JSON.stringify(THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var t=s==="dark"||s==="light"?s:"light";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" data-theme="light" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#4A0404" />
        <script
          id="alraya-theme-boot"
          dangerouslySetInnerHTML={{ __html: themeBootScript }}
        />
      </head>
      <body className={`${cairo.variable} site-body`}>{children}</body>
    </html>
  );
}

