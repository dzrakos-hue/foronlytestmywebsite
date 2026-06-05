import { useState } from "react";

export function CarGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  return (
    <div className="grid gap-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60 bg-secondary card-luxe">
        <img
          key={active}
          src={images[active]}
          alt={alt}
          width={1280}
          height={800}
          className="w-full h-full object-cover animate-fade-up"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setActive(i)}
            className={`relative aspect-[16/10] overflow-hidden rounded-xl border transition-all ${
              active === i ? "border-primary ring-2 ring-primary/40" : "border-border/60 opacity-70 hover:opacity-100"
            }`}
            aria-label={`صورة ${i + 1}`}
          >
            <img src={src} alt={`${alt} ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
