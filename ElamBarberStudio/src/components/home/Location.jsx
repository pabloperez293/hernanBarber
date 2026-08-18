import { FaMapMarkerAlt, FaDirections } from "react-icons/fa";

export default function Location() {
  return (
    <section
      id="ubicacion"
      className="bg-[#0B0B0B] px-6 py-24 text-white"
    >
      <div className="mx-auto max-w-5xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#DDC88A]">
          Visitános
        </span>

        <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
          Encontranos
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-white/60">
          Un espacio pensado para que puedas disfrutar de tu tiempo,
          relajarte y vivir la experiencia de Elam Barber Studio.
        </p>

        <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
          <FaMapMarkerAlt className="mx-auto text-3xl text-[#DDC88A]" />

          <h3 className="mt-5 text-xl font-semibold">
            Elam Barber Studio
          </h3>

          <p className="mt-2 text-white/60">
            Dirección de la barbería
          </p>

          <a
            href="https://www.google.com/maps/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#DDC88A] px-6 py-3 text-sm font-bold text-[#0B0B0B] transition-all duration-300 hover:scale-105 hover:bg-[#e8d9a8]"
          >
            <FaDirections />
            Cómo llegar
          </a>
        </div>
      </div>
    </section>
  );
}