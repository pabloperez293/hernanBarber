import { useRef } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";

// Busca automáticamente todas las imágenes
// cuyo nombre comience con "pelos" y termine en .jpg.
const galleryImages = import.meta.glob(
  "../../assets/pelos*.jpg",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

const images = Object.entries(galleryImages)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src], index) => ({
    id: index,
    src,
    alt: `Trabajo realizado en Elam Barber Studio ${index + 1}`,
    path,
  }));

export default function Gallery() {
  const carouselRef = useRef(null);

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;

    const amount = carouselRef.current.clientWidth * 0.8;

    carouselRef.current.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="galeria"
      className="bg-[#0B0B0B] px-6 py-24 text-white"
    >
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#DDC88A]">
              Nuestro trabajo
            </span>

            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl md:text-5xl">
              El estilo también se ve
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/60 sm:text-base">
              Descubrí algunos de los trabajos realizados en Elam Barber
              Studio.
            </p>
          </div>

          {/* BOTONES */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => scrollCarousel("prev")}
              aria-label="Ver trabajos anteriores"
              className="
                flex h-11 w-11
                items-center justify-center
                rounded-full
                border border-white/10
                bg-white/[0.03]
                text-white/60
                transition-all duration-300
                hover:border-[#DDC88A]/40
                hover:text-[#DDC88A]
              "
            >
              <FaChevronLeft />
            </button>

            <button
              type="button"
              onClick={() => scrollCarousel("next")}
              aria-label="Ver trabajos siguientes"
              className="
                flex h-11 w-11
                items-center justify-center
                rounded-full
                border border-white/10
                bg-white/[0.03]
                text-white/60
                transition-all duration-300
                hover:border-[#DDC88A]/40
                hover:text-[#DDC88A]
              "
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        {/* CARRUSEL */}
        {images.length > 0 ? (
          <div
            ref={carouselRef}
            className="
              flex
              gap-5
              overflow-x-auto
              scroll-smooth
              snap-x
              snap-mandatory
              pb-4
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {images.map((image) => (
              <div
                key={image.id}
                className="
                  group
                  relative
                  h-[420px]
                  min-w-[280px]
                  snap-start
                  overflow-hidden
                  rounded-3xl
                  border border-white/10
                  bg-white/[0.03]
                  sm:min-w-[340px]
                  lg:min-w-[390px]
                "
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-105
                  "
                />

                {/* Overlay */}
                <div
                  className="
                    absolute inset-0
                    bg-gradient-to-t
                    from-black/60
                    via-transparent
                    to-transparent
                    opacity-70
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                  "
                />

                {/* Detalle inferior */}
                <div
                  className="
                    absolute
                    bottom-0
                    left-0
                    right-0
                    p-6
                  "
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#DDC88A]">
                    Elam Barber Studio
                  </span>

                  <div className="mt-2 h-px w-10 bg-[#DDC88A]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-sm text-white/50">
              Todavía no hay imágenes disponibles en la galería.
            </p>
          </div>
        )}

        {/* INDICADOR */}
        {images.length > 0 && (
          <p className="mt-5 text-center text-xs text-white/30">
            Deslizá para ver más trabajos
          </p>
        )}
      </div>
    </section>
  );
}