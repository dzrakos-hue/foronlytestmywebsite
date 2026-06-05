import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { formatPrice, type Car } from "@/data/car-assets";

export function CarCard({ car, index = 0 }: { car: Car; index?: number }) {
  return (
    <article
      className="card-luxe card-luxe-hover rounded-2xl overflow-hidden group animate-fade-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Link to="/cars/$carId" params={{ carId: car.id }} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
          <img
            src={car.images[0]}
            alt={car.name}
            loading="lazy"
            width={1280}
            height={800}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-md text-xs font-medium px-3 py-1 rounded-full border border-border/60">
            {car.category}
          </div>
        </div>
        <div className="p-5">
          <div className="text-xs text-muted-foreground">{car.brand} · {car.year}</div>
          <h3 className="mt-1 text-lg font-bold">{car.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{car.short_desc}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-gradient-gold font-bold text-lg">{formatPrice(car.price)}</span>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
              عرض التفاصيل <ArrowLeft size={16} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
