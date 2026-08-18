import { useState } from "react";
// Eliminá la importación de Instagram desde lucide-react
import { FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";

import { FiMenu, FiX } from "react-icons/fi";
// Usalo en tu componente como <FaInstagram />
import logo from "../../assets/jr.jpg";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Barberos", href: "#barberos" },
  { label: "Galería", href: "#galeria" },
  { label: "Ubicación", href: "#ubicacion" },
];

const WHATSAPP_NUMBER = "1166023096";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`;

  const handleMenuClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B0B0B]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl item center justify-between px-4 sm:px-6 lg:px-8">
        {/*Logo*/}
        <a
          href="inicio"
          className="flex items-center gap-3"
          onClick={handleMenuClick}
        >
          <img
            src={"../../assets/jr.jpg"}
            Alt="Elambarber"
            className="h-12 w-12 rounded-full object-cover border border-[#DDC88A]/4"
          />

          <div className="hidden sm:block">
            <span className="block text-sm font-semibold tracking-[0.25em] text-[#DDC88A]">
              HERNAN
            </span>

            <span className="block text-xs tracking-[0.35em] text-white">
              BARBER
            </span>
          </div>
        </a>

        {/* DESKTOP NAV */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="
                group relative
                text-sm font-medium text-gray-300
                transition-colors duration-300
                hover:text-[#DDC88A]
              "
            >
              {link.label}

              <span
                className="
                  absolute -bottom-2 left-0 h-[1px] w-0
                  bg-[#DDC88A]
                  transition-all duration-300
                  group-hover:w-full
                "
              />
            </a>
          ))}

          {/* INSTAGRAM */}
          <a
            href="https://www.instagram.com/elambarberstudio/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de HernanBarber"
            className="text-gray-300 transition-colors duration-300 hover:text-[#DDC88A]"
          >
            <FaInstagram className="h-5 w-5" />
          </a>

          {/* WHATSAPP */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp de HernanBarber"
            className="text-gray-300 transition-colors duration-300 hover:text-[#DDC88A]"
          >
            <FaWhatsapp className="h-5 w-5" />
          </a>

          {/* CTA */}
          <a
            href="#turnos"
            className="
              rounded-full
              bg-[#DDC88A]
              px-5 py-2.5
              text-sm font-bold
              text-[#0B0B0B]
              transition-all duration-300
              hover:scale-105
              hover:bg-[#e6d49b]
              hover:shadow-lg
              hover:shadow-[#DDC88A]/20
            "
          >
            Reservar turno
          </a>
        </div>

        {/* MOBILE BUTTON */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          className="
            flex h-11 w-11 items-center justify-center
            rounded-full
            border border-white/10
            text-white
            transition-colors duration-300
            hover:border-[#DDC88A]/50
            hover:text-[#DDC88A]
            md:hidden
          "
        >
          {menuOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMenu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`
          overflow-hidden border-t border-white/5 bg-[#0B0B0B]
          transition-all duration-300 md:hidden
          ${menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="space-y-2 px-4 py-6 sm:px-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={handleMenuClick}
              className="
                block rounded-lg
                px-4 py-3
                text-base font-medium text-gray-300
                transition-all duration-300
                hover:bg-white/5
                hover:pl-6
                hover:text-[#DDC88A]
              "
            >
              {link.label}
            </a>
          ))}

          <div className="flex items-center gap-5 border-t border-white/10 pt-5">
            <a
              href="https://www.instagram.com/elambarberstudio/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de HernanBarber"
              className="text-gray-300 transition-colors hover:text-[#DDC88A]"
            >
              <Instagram className="h-5 w-5" />
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp de HernanBarber"
              className="text-gray-300 transition-colors hover:text-[#DDC88A]"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>

          <a
            href="#turnos"
            onClick={handleMenuClick}
            className="
              mt-4 block
              rounded-full
              bg-[#DDC88A]
              px-5 py-3
              text-center
              text-sm font-bold
              text-[#0B0B0B]
              transition-all duration-300
              hover:bg-[#e6d49b]
            "
          >
            Reservar turno
          </a>
        </div>
      </div>
    </nav>
  );
}
