'use client';

export default function BrandsMarquee({ brands = [] }: { brands?: { name: string }[] }) {
  if (!brands || brands.length === 0) return null;

  return (
    <div className="w-full overflow-hidden bg-white py-10 mt-8 mb-4 border-y border-gray-100 flex flex-col items-center relative">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>
      
      <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-bold mb-8 text-center">
        TRUSTED BY GROWING BUSINESSES
      </p>

      <div className="flex w-full max-w-full overflow-hidden">
        <div className="flex w-max whitespace-nowrap animate-marquee items-center gap-16 md:gap-24 px-8">
          {brands.map((brand, i) => (
            <span key={i} className="text-2xl md:text-3xl font-bold text-gray-300 uppercase tracking-tight">
              {brand.name}
            </span>
          ))}
          {/* Duplicate exactly once for perfect 50% translation loop */}
          {brands.map((brand, i) => (
            <span key={`dup-${i}`} className="text-2xl md:text-3xl font-bold text-gray-300 uppercase tracking-tight">
              {brand.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
