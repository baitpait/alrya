import { getSiteSettings } from "@/lib/site-settings";
import { SiteFooter } from "@/components/public/SiteFooter";
import { WhatsAppFloat } from "@/components/public/WhatsAppFloat";

export async function PublicChrome({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <div className="public-chrome">
      {children}
      <SiteFooter settings={settings} />
      <WhatsAppFloat
        number={settings.whatsapp_number}
        message={settings.whatsapp_default_message}
      />
    </div>
  );
}
