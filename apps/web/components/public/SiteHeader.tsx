import Link from "next/link";

const LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/portfolio", label: "أعمالنا" },
  { href: "/about", label: "من نحن" },
  { href: "/faq", label: "الأسئلة" },
  { href: "/contact", label: "تواصل" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-header-brand">
          <img
            src="/branding/alraya-studio-logo.png"
            alt="استوديو الراية"
            width={48}
            height={48}
          />
          <span>استوديو الراية</span>
        </Link>
        <nav className="site-header-nav" aria-label="التنقل الرئيسي">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          <Link className="site-header-cta" href="/book">
            سجّل طلب حجز
          </Link>
        </nav>
      </div>
    </header>
  );
}
