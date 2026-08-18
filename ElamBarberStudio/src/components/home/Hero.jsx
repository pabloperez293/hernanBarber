import { FaArrowDown, FaCalendarDays } from "react-icons/fa6";
import Fondo from "../../assets/jrHouse.jpg";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B0B0B]"
    >
      {/* 1. CAPA DE FONDO Y OVERLAYS (Separada del contenido) */}
      <div className="absolute inset-0 z-0">
        <img
          src={Fondo}
          alt="Fondo ElamBarberStudio"
          className="h-full w-full object-cover opacity-30"
        />

        {/* Overlay principal */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Degradado inferior */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0B0B0B] to-transparent" />

        {/* Acento dorado */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(221,200,138,0.08),transparent_45%)]" />
      </div>

      {/* 2. CONTENIDO PRINCIPAL (En la capa superior z-10) */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
          Familia,
          <br />
          <span className="text-[#DDC88A]">Confort & Calidad</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
          Un espacio pensado para disfrutar, relajarte y llevar tu estilo al
          próximo nivel.
        </p>

      </div>

      {/* 3. INDICADOR DE SCROLL */}
      <a
        href="#servicios"
        aria-label="Desplazarse hacia servicios"
        className="
          absolute
          bottom-6
          left-1/2
          z-20
          flex
          -translate-x-1/2
          flex-col
          items-center
          gap-2
          text-white/60
          transition-colors
          hover:text-[#DDC88A]
        "
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">
          Descubrí
        </span>
        <FaArrowDown className="animate-bounce text-sm" />
      </a>
    </section>
  );
}