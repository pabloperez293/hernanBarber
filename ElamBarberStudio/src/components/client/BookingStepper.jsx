// src/components/client/BookingStepper.jsx

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaCheckCircle,
  FaClock,
  FaPhone,
  FaUser,
  FaWhatsapp,
} from "react-icons/fa";
import { FaScissors } from "react-icons/fa6";

import { SERVICES_MOCK } from "../../data/mockData";

import {
  calculateEndTime,
  getAvailableTimeSlots,
  getDateRangeLimits,
  sanitizePhoneNumber,
} from "../../utils/bookingUtils";

const STEPS = [
  {
    number: 1,
    title: "Fecha y hora",
  },
  {
    number: 2,
    title: "Tus datos",
  },
  {
    number: 3,
    title: "Confirmación",
  },
];

const formatPrice = (price) => {
  return new Intl.NumberFormat("es-AR").format(price);
};

export default function BookingStepper() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Servicio seleccionado desde /reservar?service=ID
  const serviceId = Number(searchParams.get("service"));

  const selectedService = SERVICES_MOCK.find(
    (service) => service.id === serviceId
  );

  // Paso actual
  const [step, setStep] = useState(1);

  // Datos de la reserva
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Fechas permitidas
  const { minDate, maxDate } = getDateRangeLimits();

  // Inicializar fecha en hoy
  useEffect(() => {
    setSelectedDate(minDate);
  }, [minDate]);

  // Horarios disponibles según servicio + fecha
  const availableSlots =
    selectedService && selectedDate
      ? getAvailableTimeSlots(
          selectedDate,
          selectedService.durationMinutes
        )
      : [];

  // Cambiar fecha
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedTime("");
  };

  // Cambiar teléfono
  const handlePhoneChange = (event) => {
    const cleanValue = sanitizePhoneNumber(event.target.value);
    setClientPhone(cleanValue);
  };

  // Avanzar de paso
  const handleNextStep = () => {
    setStep((currentStep) => Math.min(currentStep + 1, 3));
  };

  // Volver de paso
  const handlePreviousStep = () => {
    setStep((currentStep) => Math.max(currentStep - 1, 1));
  };

  // WhatsApp
  const getWhatsAppLink = () => {
    const phoneNumber = "5491112345678";

    const endTime = calculateEndTime(
      selectedTime,
      selectedService.durationMinutes
    );

    const text =
      `¡Hola Elam Barber Studio! Quiero confirmar mi turno:\n\n` +
      `✂️ Servicio: ${selectedService.name}\n` +
      `📅 Fecha: ${selectedDate}\n` +
      `⏰ Horario: ${selectedTime} a ${endTime} hs\n` +
      `👤 Nombre: ${clientName}\n` +
      `📞 Teléfono: ${clientPhone}\n\n` +
      `¡Muchas gracias!`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
  };

  // Si entraron a /reservar sin servicio
  if (!selectedService) {
    return (
      <section className="min-h-screen bg-[#0B0B0B] px-6 py-32 text-center text-white">
        <div className="mx-auto max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#DDC88A]">
            Elam Barber Studio
          </p>

          <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">
            Primero elegí un servicio
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/50">
            Seleccioná el servicio que querés realizarte para poder reservar
            tu turno.
          </p>

          <button
            type="button"
            onClick={() => navigate("/#servicios")}
            className="
              mt-8
              rounded-full
              bg-[#DDC88A]
              px-6 py-3
              text-sm font-bold
              text-[#0B0B0B]
              transition-all duration-300
              hover:scale-105
              hover:bg-[#E8D9A8]
            "
          >
            Ver servicios
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="reservar"
      className="min-h-screen bg-[#0B0B0B] px-4 py-20 text-white sm:px-6"
    >
      <div className="mx-auto max-w-5xl">

        {/* ENCABEZADO */}
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-[#DDC88A]">
            Elam Barber Studio
          </span>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Reservá tu turno
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
            Elegí el horario que mejor te quede y completá tus datos para
            confirmar tu visita.
          </p>
        </div>

        {/* CONTENEDOR */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/30">

          {/* SERVICIO SELECCIONADO */}
          <div className="border-b border-white/10 p-5 sm:p-8">
            <div className="rounded-2xl border border-[#DDC88A]/20 bg-[#DDC88A]/5 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[#DDC88A]/70">
                    Servicio seleccionado
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DDC88A]/10 text-[#DDC88A]">
                      <FaScissors />
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold">
                        {selectedService.name}
                      </h2>

                      <p className="text-sm text-white/40">
                        {selectedService.durationMinutes} minutos
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-2xl font-semibold text-[#DDC88A]">
                  ${formatPrice(selectedService.price)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/#servicios")}
                className="mt-4 text-xs text-white/40 transition-colors hover:text-[#DDC88A]"
              >
                Cambiar servicio
              </button>
            </div>
          </div>

          {/* STEPPER */}
          <div className="border-b border-white/10 px-5 py-6 sm:px-8">
            <div className="mx-auto flex max-w-2xl items-center justify-between">

              {STEPS.map((item, index) => {
                const isActive = step === item.number;
                const isCompleted = step > item.number;

                return (
                  <div
                    key={item.number}
                    className="flex min-w-0 flex-1 items-center"
                  >
                    <div className="flex min-w-0 flex-col items-center">
                      <div
                        className={`
                          flex h-11 w-11 items-center justify-center
                          rounded-full border
                          text-sm font-bold
                          transition-all duration-300
                          ${
                            isCompleted
                              ? "border-[#DDC88A] bg-[#DDC88A] text-[#0B0B0B]"
                              : isActive
                                ? "border-[#DDC88A] bg-[#DDC88A]/10 text-[#DDC88A]"
                                : "border-white/10 bg-white/[0.03] text-white/30"
                          }
                        `}
                      >
                        {isCompleted ? <FaCheck /> : item.number}
                      </div>

                      <span
                        className={`
                          mt-2 hidden text-[10px] font-semibold uppercase tracking-wider sm:block
                          ${
                            isActive || isCompleted
                              ? "text-[#DDC88A]"
                              : "text-white/30"
                          }
                        `}
                      >
                        {item.title}
                      </span>
                    </div>

                    {index < STEPS.length - 1 && (
                      <div
                        className={`
                          mx-3 h-px flex-1 transition-colors duration-500
                          ${
                            step > item.number
                              ? "bg-[#DDC88A]"
                              : "bg-white/10"
                          }
                        `}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONTENIDO */}
          <div className="p-5 sm:p-8 lg:p-10">

            {/* PASO 1 - FECHA Y HORA */}
            {step === 1 && (
              <div>
                <div className="mb-8">
                  <span className="text-xs uppercase tracking-[0.3em] text-[#DDC88A]">
                    Paso 1
                  </span>

                  <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                    Elegí fecha y hora
                  </h2>

                  <p className="mt-2 text-sm text-white/50">
                    Buscá el horario que mejor se adapte a vos.
                  </p>
                </div>

                {/* FECHA */}
                <div className="mb-8">
                  <label
                    htmlFor="booking-date"
                    className="mb-3 block text-sm font-medium text-white/70"
                  >
                    Fecha del turno
                  </label>

                  <div className="relative">
                    <FaCalendarAlt className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#DDC88A]" />

                    <input
                      id="booking-date"
                      type="date"
                      min={minDate}
                      max={maxDate}
                      value={selectedDate}
                      onChange={handleDateChange}
                      className="
                        w-full rounded-xl border border-white/10
                        bg-[#111111]
                        py-3 pl-11 pr-4
                        text-white
                        outline-none
                        transition-colors
                        focus:border-[#DDC88A]/60
                      "
                    />
                  </div>

                  <p className="mt-2 text-xs text-white/30">
                    Disponible desde hoy hasta el último día del mes actual.
                  </p>
                </div>

                {/* HORARIOS */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-white/70">
                      Horarios disponibles
                    </span>

                    <span className="text-xs text-white/30">
                      {availableSlots.length} disponibles
                    </span>
                  </div>

                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                      {availableSlots.map((time) => {
                        const isSelected = selectedTime === time;

                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`
                              rounded-xl border px-3 py-3 text-sm font-semibold
                              transition-all duration-300
                              ${
                                isSelected
                                  ? "border-[#DDC88A] bg-[#DDC88A] text-[#0B0B0B]"
                                  : "border-white/10 bg-white/[0.03] text-white/70 hover:border-[#DDC88A]/40 hover:text-[#DDC88A]"
                              }
                            `}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#DDC88A]/20 bg-[#DDC88A]/5 p-6 text-center">
                      <FaClock className="mx-auto text-2xl text-[#DDC88A]" />

                      <p className="mt-3 text-sm font-medium text-white">
                        No hay horarios disponibles
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        Probá con otra fecha.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!selectedTime}
                  onClick={handleNextStep}
                  className="
                    mt-8
                    w-full
                    rounded-xl
                    bg-[#DDC88A]
                    px-5 py-4
                    text-sm font-bold
                    text-[#0B0B0B]
                    transition-all duration-300
                    hover:bg-[#E8D9A8]
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                >
                  Continuar
                </button>
              </div>
            )}

            {/* PASO 2 - DATOS */}
            {step === 2 && (
              <div>
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-[#DDC88A]"
                >
                  <FaArrowLeft />
                  Volver
                </button>

                <div className="mb-8">
                  <span className="text-xs uppercase tracking-[0.3em] text-[#DDC88A]">
                    Paso 2
                  </span>

                  <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                    Completá tus datos
                  </h2>

                  <p className="mt-2 text-sm text-white/50">
                    Los necesitamos para confirmar tu turno.
                  </p>
                </div>

                {/* DATOS */}
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="client-name"
                      className="mb-2 block text-sm font-medium text-white/70"
                    >
                      Nombre completo
                    </label>

                    <div className="relative">
                      <FaUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />

                      <input
                        id="client-name"
                        type="text"
                        placeholder="Ej: Matías"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="
                          w-full rounded-xl border border-white/10
                          bg-[#111111]
                          py-3 pl-11 pr-4
                          text-white
                          outline-none
                          placeholder:text-white/20
                          focus:border-[#DDC88A]/60
                        "
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="client-phone"
                      className="mb-2 block text-sm font-medium text-white/70"
                    >
                      Teléfono / WhatsApp
                    </label>

                    <div className="relative">
                      <FaPhone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />

                      <input
                        id="client-phone"
                        type="text"
                        inputMode="numeric"
                        placeholder="Ej: 1123456789"
                        value={clientPhone}
                        onChange={handlePhoneChange}
                        className="
                          w-full rounded-xl border border-white/10
                          bg-[#111111]
                          py-3 pl-11 pr-4
                          text-white
                          outline-none
                          placeholder:text-white/20
                          focus:border-[#DDC88A]/60
                        "
                      />
                    </div>

                    <p className="mt-2 text-xs text-white/30">
                      Solo números.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    !clientName.trim() ||
                    clientPhone.length < 8
                  }
                  onClick={handleNextStep}
                  className="
                    mt-8
                    w-full
                    rounded-xl
                    bg-[#DDC88A]
                    px-5 py-4
                    text-sm font-bold
                    text-[#0B0B0B]
                    transition-all duration-300
                    hover:bg-[#E8D9A8]
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                >
                  Revisar reserva
                </button>
              </div>
            )}

            {/* PASO 3 - CONFIRMACIÓN */}
            {step === 3 && (
              <div>
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-[#DDC88A]"
                >
                  <FaArrowLeft />
                  Volver
                </button>

                <div className="mb-8">
                  <span className="text-xs uppercase tracking-[0.3em] text-[#DDC88A]">
                    Paso 3
                  </span>

                  <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                    Revisá tu reserva
                  </h2>

                  <p className="mt-2 text-sm text-white/50">
                    Confirmá que todos los datos sean correctos.
                  </p>
                </div>

                {/* RESUMEN */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.25em] text-white/40">
                      Tu reserva
                    </span>

                    <FaCheckCircle className="text-[#DDC88A]" />
                  </div>

                  <div className="mt-6 space-y-4 text-sm">

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-white/40">
                        Servicio
                      </span>

                      <strong className="text-right text-white">
                        {selectedService.name}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-white/40">
                        Fecha
                      </span>

                      <strong className="text-white">
                        {selectedDate}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-white/40">
                        Horario
                      </span>

                      <strong className="text-[#DDC88A]">
                        {selectedTime} -{" "}
                        {calculateEndTime(
                          selectedTime,
                          selectedService.durationMinutes
                        )}{" "}
                        hs
                      </strong>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-white/40">
                        Cliente
                      </span>

                      <strong className="text-white">
                        {clientName}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-white/40">
                        WhatsApp
                      </span>

                      <strong className="text-white">
                        {clientPhone}
                      </strong>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white/50">
                          Total
                        </span>

                        <strong className="text-2xl text-[#DDC88A]">
                          ${formatPrice(selectedService.price)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WHATSAPP */}
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-8
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    bg-[#076428]
                    px-5 py-4
                    text-sm font-bold
                    text-white
                    transition-all duration-300
                    hover:bg-[#087A31]
                    hover:shadow-lg
                    hover:shadow-[#076428]/20
                  "
                >
                  <FaWhatsapp className="text-lg" />
                  Confirmar turno por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/25">
          Familia, Confort & Calidad · Elam Barber Studio
        </p>
      </div>
    </section>
  );
}