import { ArrowDown, CalendarDays } from 'react-icons/fa'

import Fondo from '../../assets/jrHouse.jpg'

export default function Hero() {
  return (
        <section
      id="inicio"
      className="relative min-h-screen overflow-hidden bg-[#0B0B0B]"
    > 
        {/* Fondo */}
        <div className="absolute inset-0 " >
        <img src={Fondo } alt='Fondo' className="w-full h-full object-cover opacity-30" />
    
     {/* overlaay principal */}
     <div className="absolute inset-0 bg-black opacity-50"/>
    
    {/* degradado inferior */}
    <div className=" absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0B0B0B] to-transparent" />

    {/* Acento dorado */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(221,200,138,0.08),transparent_45%)]" />
    
    {/* Contenido principal */}
  <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-32">
    <div className="mx-auto max-w-4xl text-center">

      <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
        Familia,
        <br />
        <span className="text-[#DDC88A]">
          Confort & Calidad
        </span>
      </h1>

      <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
        Un espacio pensado para disfrutar, relajarte y llevar tu estilo
        al próximo nivel.
      </p>

      {/* Único CTA del Hero */}
      <a
        href="#turnos"
        className="
          mt-10
          inline-flex
          items-center
          gap-3
          rounded-full
          bg-[#DDC88A]
          px-7
          py-3.5
          text-sm
          font-bold
          text-[#0B0B0B]
          transition-all
          duration-300
          hover:scale-105
          hover:bg-[#e8d9a8]
          hover:shadow-lg
          hover:shadow-[#DDC88A]/20
        "
      >
        <CalendarDays className="text-sm" />
        Reservar turno
      </a>
    </div>
  </div>

  {/* Indicador de scroll */}
  <a
    href="#servicios"
    aria-label="Desplazarse hacia servicios"
    className="
      absolute
      bottom-8
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

    <ArrowDown className="animate-bounce text-sm" />
  </a>

    </div>
    
    </section>
  )
}


