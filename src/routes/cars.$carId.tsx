import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Gauge, Cog, Zap, Users, Fuel, Settings2, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CarGallery } from "@/components/CarGallery";
import { OrderDialog } from "@/components/OrderDialog";
import { getCarById } from "@/lib/cars.functions";
import { resolveCarImages, formatPrice } from "@/data/car-assets";

export const Route = createFileRoute("/cars/$carId")({
  component: CarPage,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">السيارة غير موجودة</h1>
      <Link to="/" className="mt-6 inline-flex btn-gold btn-gold-hover rounded-full px-6 py-3 font-bold">العودة</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">حدث خطأ في تحميل بيانات السيارة</h1>
    </div>
  ),
});

function CarPage() {
  const { carId } = Route.useParams();
  const fetchCar = useServerFn(getCarById);
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["car", carId],
    queryFn: () => fetchCar({ data: { id: carId } }),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 grid place-items-center text-muted-foreground">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (!data) throw notFound();

  const car = {
    id: data.id as string,
    name: data.name as string,
    brand: data.brand as string,
    price: Number(data.price),
    year: data.year as number,
    category: data.category as string,
    short_desc: data.short_desc as string,
    images: resolveCarImages(data.images),
    specs: data.specs as any,
  };

  const specs = [
    { icon: Cog, label: "المحرك", value: car.specs.engine },
    { icon: Zap, label: "القوة", value: car.specs.power },
    { icon: Settings2, label: "ناقل الحركة", value: car.specs.transmission },
    { icon: Gauge, label: "التسارع", value: car.specs.acceleration },
    { icon: Gauge, label: "السرعة القصوى", value: car.specs.topSpeed },
    { icon: Cog, label: "نظام الدفع", value: car.specs.drive },
    { icon: Fuel, label: "الوقود", value: car.specs.fuel },
    { icon: Users, label: "المقاعد", value: car.specs.seats },
  ];

  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowRight size={16} /> العودة إلى المعرض
      </Link>

      <div className="grid lg:grid-cols-2 gap-10">
        <CarGallery images={car.images} alt={car.name} />

        <div className="animate-fade-up">
          <div className="text-sm text-primary font-semibold">{car.brand} · {car.year}</div>
          <h1 className="mt-2 text-3xl md:text-4xl font-black">{car.name}</h1>
          <div className="mt-2 inline-block text-xs bg-secondary border border-border/60 rounded-full px-3 py-1">
            {car.category}
          </div>
          <p className="mt-5 text-muted-foreground leading-relaxed">{car.short_desc}</p>

          <div className="mt-6 p-5 rounded-2xl card-luxe">
            <div className="text-sm text-muted-foreground">السعر</div>
            <div className="text-3xl md:text-4xl font-black text-gradient-gold mt-1">{formatPrice(car.price)}</div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="mt-6 w-full btn-gold btn-gold-hover rounded-full px-7 py-4 font-bold text-base"
          >
            اطلب هذه السيارة
          </button>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">المواصفات الكاملة</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {specs.map((s, i) => (
            <div key={i} className="card-luxe rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center gap-2 text-primary"><s.icon size={18} /><span className="text-xs font-semibold">{s.label}</span></div>
              <div className="mt-2 font-bold">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      <OrderDialog open={open} onOpenChange={setOpen} carId={car.id} carName={car.name} />
    </div>
  );
}
