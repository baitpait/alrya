import Link from "next/link";
import { waMeUrl, visibleSocialLinks, type SiteSettings } from "@/lib/site-settings";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const socials = visibleSocialLinks(settings);
  const wa = waMeUrl(settings.whatsapp_number, settings.whatsapp_default_message);
  const phone = settings.phone_public.trim();
  const email = settings.email_public.trim();
  const address = settings.address_text.trim();
  const hasContact = Boolean(phone || wa || email || address);

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand-block">
          <img
            src="/branding/alraya-studio-logo.png"
            alt=""
            width={44}
            height={44}
          />
          <p className="site-footer-brand">استوديو الراية</p>
          <p className="site-footer-tag">علامة الجودة والاحتراف</p>
        </div>

        <nav className="site-footer-nav" aria-label="روابط عامة">
          <Link href="/">الرئيسية</Link>
          <Link href="/portfolio">أعمالنا</Link>
          <Link href="/about">من نحن</Link>
          <Link href="/faq">الأسئلة</Link>
          <Link href="/contact">تواصل معنا</Link>
          <Link className="site-footer-cta" href="/book">
            سجّل طلب حجز
          </Link>
        </nav>

        {hasContact ? (
          <div className="site-footer-contact">
            {phone ? (
              <a href={`tel:${phone}`} className="cell-ltr">
                {phone}
              </a>
            ) : null}
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer">
                واتساب
              </a>
            ) : null}
            {email ? <a href={`mailto:${email}`}>{email}</a> : null}
            {address ? <span>{address}</span> : null}
          </div>
        ) : null}

        {socials.length > 0 ? (
          <ul className="site-socials">
            {socials.map((s) => (
              <li key={s.key}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="site-footer-admin">
          <Link href="/admin">دخول لوحة الإدارة</Link>
        </p>
      </div>
    </footer>
  );
}
