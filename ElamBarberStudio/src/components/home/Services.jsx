import { useMemo, useState } from "react";
import { FaClock, FaScissors } from "react-icons/fa6";
import { SERVICES_MOCK } from "../../data/mockData";

const FILTERS = [
  { id: "cabello", label: "Cabello" },
  { id: "combos", label: "Combos" },
  { id: "facial", label: "Facial" },
  { id: "tratamientos", label: "Tratamientos" },
  { id: "color", label: "Color" },
];

const formatPrice = (price) => {
  return new Intl.NumberFormat("es-AR").format(price);
};

export default function Services() {
  // Inicializamos directamente con el primer filtro ("cabello")
  const [activeFilter, setActiveFilter] = useState(FILTERS[0].id);

  // Filtramos la lista según la categoría seleccionada
  const filteredServices = useMemo(() => {
    return SERVICES_MOCK.filter(
      (service) => service.category.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [activeFilter]);

  return (
    <section id="servicios" className="bg-[#0B0B0B] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#DDC88A]">
            Nuestros servicios
          </span>

          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl md:text-5xl">
            Elegí tu experiencia
          </h2>

          <p className="mt-5 text-sm leading-7 text-white/60 sm:text-base">
            Encontrá el servicio que mejor se adapte a vos y reservá tu turno de
            forma simple.
          </p>
        </div>

        {/* FILTROS */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`
                    rounded-full
                    border
                    px-4 py-2
                    text-xs font-semibold
                    transition-all duration-300
                    ${
                      isActive
                        ? "border-[#DDC88A] bg-[#DDC88A] text-[#0B0B0B]"
                        : "border-white/10 bg-white/[0.03] text-white/60 hover:border-[#DDC88A]/40 hover:text-[#DDC88A]"
                    }
                  `}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* SERVICIOS */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <article
              key={service.id}
              className="
                  group
                  rounded-2xl
                  border border-white/10
                  bg-white/[0.03]
                  p-6
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-[#DDC88A]/40
                  hover:bg-white/[0.05]
                "
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DDC88A]/10 text-[#DDC88A]">
                  <FaScissors />
                </div>

                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/50">
                  {service.category}
                </span>
              </div>

              <h3 className="mt-6 text-xl font-semibold">{service.name}</h3>

              <p className="mt-2 min-h-[48px] text-sm leading-6 text-white/50">
                {service.description}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <FaClock className="text-[#DDC88A]" />
                  {service.durationMinutes} min
                </div>

                <span className="text-xl font-semibold text-[#DDC88A]">
                  ${formatPrice(service.price)}
                </span>
              </div>

              <a
                href="#turnos"
                className="
                    mt-6
                    block
                    rounded-xl
                    border border-[#DDC88A]/20
                    px-4 py-3
                    text-center
                    text-sm font-semibold
                    text-[#DDC88A]
                    transition-all duration-300
                    hover:bg-[#DDC88A]
                    hover:text-[#0B0B0B]
                  "
              >
                Elegir servicio
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}