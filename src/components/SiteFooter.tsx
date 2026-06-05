import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getPublicSiteSettings } from "@/lib/site-settings.functions";

export function SiteFooter() {
  const getSettings = useServerFn(getPublicSiteSettings);
  const { data } = useQuery({ queryKey: ["site_settings"], queryFn: () => getSettings() });
  const siteName = data?.site_name ?? "AUTOLUXE";
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/40">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="inline-block w-8 h-8 rounded-md bg-[var(--gradient-gold)] grid place-items-center text-primary-foreground">{siteName.charAt(0).toUpperCase()}</span>
            <span className="text-gradient-gold">{siteName}</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            وكيلكم المعتمد لأفخم السيارات الجديدة. خبرة، ثقة، وخدمة استثنائية.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">روابط</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">الرئيسية</Link></li>
            <li><Link to="/about" className="hover:text-primary">من نحن</Link></li>
            <li><Link to="/contact" className="hover:text-primary">اتصل بنا</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">تواصل معنا</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>الهاتف: 0560 00 00 00</li>
            <li>البريد: contact@autoluxe.com</li>
            <li>العنوان: شارع الاستقلال، الجزائر العاصمة</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteName} — جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
