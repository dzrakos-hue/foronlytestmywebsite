import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "اتصل بنا — AUTOLUXE" },
      { name: "description", content: "تواصل مع فريق AUTOLUXE للاستفسار عن أي سيارة أو خدمة." },
      { property: "og:title", content: "اتصل بنا — AUTOLUXE" },
      { property: "og:description", content: "نحن هنا للإجابة على جميع استفساراتك." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center animate-fade-up">
        <span className="text-sm text-primary font-semibold">اتصل بنا</span>
        <h1 className="mt-3 text-4xl md:text-5xl font-black">نحن هنا <span className="text-gradient-gold">لخدمتك</span></h1>
        <p className="mt-4 text-muted-foreground">فريقنا متاح للإجابة على جميع استفساراتك ومساعدتك في اختيار السيارة المثالية.</p>
      </div>

      <div className="mt-12 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 grid gap-4">
          {[
            { icon: Phone, title: "الهاتف", value: "0560 00 00 00" },
            { icon: Mail, title: "البريد الإلكتروني", value: "contact@autoluxe.com" },
            { icon: MapPin, title: "العنوان", value: "شارع الاستقلال، الجزائر العاصمة" },
            { icon: Clock, title: "أوقات العمل", value: "السبت — الخميس · 9ص — 7م" },
          ].map((c, i) => (
            <div key={i} className="card-luxe rounded-2xl p-5 flex items-start gap-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary grid place-items-center"><c.icon size={20} /></div>
              <div>
                <div className="text-xs text-muted-foreground">{c.title}</div>
                <div className="font-semibold mt-0.5">{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        <form
          className="lg:col-span-3 card-luxe rounded-2xl p-6 md:p-8 grid gap-4 animate-fade-up"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("تم إرسال رسالتك، سنعود إليك قريبًا.");
            (e.currentTarget as HTMLFormElement).reset();
          }}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-1.5"><Label htmlFor="cname">الاسم الكامل</Label><Input id="cname" required maxLength={150} /></div>
            <div className="grid gap-1.5"><Label htmlFor="cphone">الهاتف</Label><Input id="cphone" type="tel" required maxLength={30} dir="ltr" /></div>
          </div>
          <div className="grid gap-1.5"><Label htmlFor="cemail">البريد الإلكتروني</Label><Input id="cemail" type="email" maxLength={200} dir="ltr" /></div>
          <div className="grid gap-1.5"><Label htmlFor="cmsg">رسالتك</Label><Textarea id="cmsg" rows={5} required maxLength={1000} /></div>
          <button type="submit" className="btn-gold btn-gold-hover rounded-full px-7 py-3 font-bold mt-2">إرسال الرسالة</button>
        </form>
      </div>
    </div>
  );
}
