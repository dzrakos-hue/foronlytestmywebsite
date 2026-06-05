import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Shield, Sparkles, Truck, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import heroImg from "@/assets/hero.jpg";
import { CarCard } from "@/components/CarCard";
import { listCars } from "@/lib/cars.functions";
import { resolveCarImages, type Car } from "@/data/car-assets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AUTOLUXE — السيارات الجديدة الفاخرة" },
      { name: "description", content: "تصفح مجموعة فاخرة من السيارات الجديدة: سيدان، SUV، كوبيه ورياضية." },
      { property: "og:title", content: "AUTOLUXE — السيارات الجديدة الفاخرة" },
      { property: "og:description", content: "تصفح مجموعة فاخرة من السيارات الجديدة." },
    ],
  }),
  component: Index,
});

function Index() {
  const fetchCars = useServerFn(listCars);
  const { data = [], isLoading } = useQuery({
    queryKey: ["cars"],
    queryFn: () => fetchCars(),
  });

  const cars: Car[] = data.map((c: any) => ({
    id: c.id,
    name: c.name,
    brand: c.brand,
    price: Number(c.price),
    year: c.year,
    category: c.category,
    short_desc: c.short_desc,
    images: resolveCarImages(c.images),
    specs: c.specs,
  }));

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="معرض السيارات الفاخرة" width={1920} height={1080} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        </div>
        <div className="relative container mx-auto px-4 py-28 md:py-40">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/30 rounded-full px-4 py-1.5">
              <Sparkles size={14} /> موديلات 2025
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl font-black leading-tight">
              قُد التميُّز.{" "}
              <span className="text-gradient-gold">اكتشف أفخم</span>{" "}
              السيارات الجديدة.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              تشكيلة حصرية من أرقى الماركات العالمية، مع تجربة شراء سلسة وخدمة ما بعد البيع متميزة.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#cars" className="btn-gold btn-gold-hover rounded-full px-7 py-3.5 font-bold inline-flex items-center gap-2">
                تصفح السيارات <ChevronLeft size={18} />
              </a>
              <Link to="/contact" className="rounded-full border border-border bg-background/40 backdrop-blur px-7 py-3.5 font-semibold hover:bg-accent transition-colors">
                تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Shield, title: "ضمان رسمي", desc: "كل سيارة تأتي مع ضمان وكيل معتمد." },
            { icon: Truck, title: "توصيل لكل الولايات", desc: "نُوصل سيارتك إلى باب منزلك." },
            { icon: Sparkles, title: "تشكيلة حصرية", desc: "أحدث الموديلات والإصدارات الفاخرة." },
          ].map((f, i) => (
            <div key={f.title} className="card-luxe rounded-2xl p-5 flex items-start gap-4 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary grid place-items-center"><f.icon size={20} /></div>
              <div>
                <h3 className="font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="cars" className="container mx-auto px-4 py-20 scroll-mt-20">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <span className="text-sm text-primary font-semibold">مجموعتنا</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2">سيارات مختارة بعناية</h2>
          </div>
          <p className="text-muted-foreground max-w-md">
            من السيدان الأنيقة إلى السوبر كار، اختر ما يناسب أسلوب حياتك.
          </p>
        </div>
        {isLoading ? (
          <div className="py-20 grid place-items-center text-muted-foreground">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((c, i) => <CarCard key={c.id} car={c} index={i} />)}
          </div>
        )}
      </section>
    </>
  );
}
