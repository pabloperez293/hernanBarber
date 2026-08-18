import {
  FaInstagram,
  FaWhatsapp,
  FaArrowUp,
} from "react-icons/fa";

export default function Footer() {
  const whatsappNumber = "5491112345678";

  return (
    <footer className="border-t border-white/10 bg-[#0B0B0B] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">

        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">

          {/* BRAND */}
          <div>
            <h3 className="text-xl font-semibold tracking-[0.2em] text-[#DDC88A]">
              ELAM
            </h3>

            <p className="mt-2 text-sm tracking-[0.25em] text-white/60">
              BARBER STUDIO
            </p>

            <p className="mt-4 text-sm text-white/50">
              Familia, Confort & Calidad
            </p>
          </div>

          {/* NAV */}
          <nav className="flex flex-wrap gap-5 text-sm text-white/60">
            <a
              href="#inicio"
              className="transition-colors hover:text-[#DDC88A]"
            >
              Inicio
            </a>

            <a
              href="#servicios"
              className="transition-colors hover:text-[#DDC88A]"
            >
              Servicios
            </a>

            <a
              href="#barberos"
              className="transition-colors hover:text-[#DDC88A]"
            >
              Barberos
            </a>

            <a
              href="#ubicacion"
              className="transition-colors hover:text-[#DDC88A]"
            >
              Ubicación
            </a>

            <a
              href="#turnos"
              className="transition-colors hover:text-[#DDC88A]"
            >
              Reservar turno
            </a>
          </nav>

          {/* SOCIAL */}
          <div className="flex items-center gap-4">

            <a
              href="https://www.instagram.com/elambarberstudio/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all duration-300 hover:border-[#DDC88A]/40 hover:text-[#DDC88A]"
            >
              <FaInstagram />
            </a>

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all duration-300 hover:border-[#DDC88A]/40 hover:text-[#DDC88A]"
            >
              <FaWhatsapp />
            </a>

            <a
              href="#inicio"
              aria-label="Volver arriba"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all duration-300 hover:border-[#DDC88A]/40 hover:text-[#DDC88A]"
            >
              <FaArrowUp />
            </a>

          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Elam Barber Studio. Todos los derechos reservados.
        </div>

      </div>
    </footer>
  );
}