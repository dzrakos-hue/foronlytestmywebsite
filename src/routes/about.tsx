import { createFileRoute } from "@tanstack/react-router";
import { Award, Heart, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "من نحن — AUTOLUXE" },
      { name: "description", content: "تعرّف على AUTOLUXE، رفيقك الموثوق في عالم السيارات الفاخرة الجديدة." },
      { property: "og:title", content: "من نحن — AUTOLUXE" },
      { property: "og:description", content: "قصة شغف بالسيارات وخدمة عملاء استثنائية." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center animate-fade-up">
        <span className="text-sm text-primary font-semibold">من نحن</span>
        <h1 className="mt-3 text-4xl md:text-5xl font-black">
          شغف <span className="text-gradient-gold">السيارات الفاخرة</span> منذ 2010
        </h1>
        <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
          في AUTOLUXE نؤمن بأن السيارة ليست مجرد وسيلة تنقّل، بل هي تعبير عن الشخصية والذوق.
          نقدّم لعملائنا أحدث الموديلات من أفخم الماركات العالمية، مع تجربة شراء راقية وخدمة استثنائية.
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Award, title: "15+ سنة خبرة", desc: "خبرة طويلة في سوق السيارات الفاخرة." },
          { icon: Users, title: "آلاف العملاء", desc: "ثقة متجددة من عملائنا في كل ولاية." },
          { icon: ShieldCheck, title: "ضمان رسمي", desc: "كل سياراتنا جديدة بضمان الوكيل." },
          { icon: Heart, title: "خدمة بشغف", desc: "فريق متخصص لمساعدتك في الاختيار." },
        ].map((f, i) => (
          <div key={i} className="card-luxe rounded-2xl p-6 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary grid place-items-center"><f.icon size={22} /></div>
            <h3 className="mt-4 font-bold text-lg">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 card-luxe rounded-2xl p-8 md:p-12 grid md:grid-cols-3 gap-6 text-center">
        {[
          { k: "+5,000", v: "عميل سعيد" },
          { k: "+200", v: "موديل متوفر" },
          { k: "48 ولاية", v: "تغطية كاملة" },
        ].map((s) => (
          <div key={s.v}>
            <div className="text-4xl font-black text-gradient-gold">{s.k}</div>
            <div className="mt-2 text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
