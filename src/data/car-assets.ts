import car1 from "@/assets/car-1.jpg";
import car2 from "@/assets/car-2.jpg";
import car3 from "@/assets/car-3.jpg";
import car4 from "@/assets/car-4.jpg";
import car5 from "@/assets/car-5.jpg";
import car6 from "@/assets/car-6.jpg";

export const carAssetMap: Record<string, string> = {
  "car-1": car1,
  "car-2": car2,
  "car-3": car3,
  "car-4": car4,
  "car-5": car5,
  "car-6": car6,
};

export function resolveCarImages(keys: string[] | unknown): string[] {
  if (!Array.isArray(keys)) return [car1];
  const resolved = keys
    .map((k) => (typeof k === "string" ? carAssetMap[k] ?? k : null))
    .filter((x): x is string => !!x);
  return resolved.length ? resolved : [car1];
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("ar-DZ", { maximumFractionDigits: 0 }).format(n) + " دج";

export type CarSpecs = {
  engine: string;
  power: string;
  transmission: string;
  drive: string;
  acceleration: string;
  topSpeed: string;
  fuel: string;
  seats: string;
};

export type Car = {
  id: string;
  name: string;
  brand: string;
  price: number;
  year: number;
  category: string;
  short_desc: string;
  images: string[]; // resolved URLs
  specs: CarSpecs;
};
