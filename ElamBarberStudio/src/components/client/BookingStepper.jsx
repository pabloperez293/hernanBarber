
import { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaUserTag,
  FaWhatsapp,
} from "react-icons/fa";

import { FaScissors } from "react-icons/fa6";

import {
  calculateEndTime,
  getAvailableTimeSlots,
  getDateRangeLimits,
  sanitizePhoneNumber,
} from "../../utils/bookingUtils";

import {
  getServices,
  getBarbers,
  getAvailability,
  createAppointment,
} from "../../utils/bookingApi";

const STEPS = [
  {
    number: 1,
    title: "Barbero, Fecha y hora",
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

const formatPrice = (price) =>
  new Intl.NumberFormat("es-AR").format(price);

export default function BookingStepper() {
  const [searchParams] =
    useSearchParams();

  const navigate = useNavigate();

  const serviceId = Number(
    searchParams.get("service")
  );

  // Estados de datos
  const [services, setServices] =
    useState([]);

  const [barbers, setBarbers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // Estado de disponibilidad
  const [availability, setAvailability] =
    useState({});

  const [
    loadingAvailability,
    setLoadingAvailability,
  ] = useState(false);

  // Estados del stepper
  const [step, setStep] =
    useState(1);

  const [
    selectedBarber,
    setSelectedBarber,
  ] = useState("");

  const [
    selectedDate,
    setSelectedDate,
  ] = useState("");

  const [
    selectedTime,
    setSelectedTime,
  ] = useState("");

  const [
    clientName,
    setClientName,
  ] = useState("");

  const [
    clientPhone,
    setClientPhone,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const { minDate, maxDate } =
    getDateRangeLimits();

  /**
   * =========================================================
   * CARGAR SERVICIOS Y BARBEROS
   * =========================================================
   *
   * Ya no usamos localhost:4000.
   * bookingApi.js decide de dónde obtener los datos.
   */

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          servicesData,
          barbersData,
        ] = await Promise.all([
          getServices(),
          getBarbers(),
        ]);

        setServices(
          Array.isArray(servicesData)
            ? servicesData
            : []
        );

        setBarbers(
          Array.isArray(barbersData)
            ? barbersData
            : []
        );

        /**
         * No seleccionamos "Cualquiera disponible"
         * automáticamente.
         *
         * La disponibilidad real se resolverá
         * cuando el cliente elija horario.
         */
      } catch (error) {
        console.error(
          "Error cargando los datos:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();

    setSelectedDate(minDate);
  }, [minDate]);

  /**
   * =========================================================
   * SERVICIO SELECCIONADO
   * =========================================================
   */

  const selectedService =
    services.find(
      (service) =>
        Number(service.id) ===
        serviceId
    );

  /**
   * =========================================================
   * HORARIOS DISPONIBLES
   * =========================================================
   */

  const availableSlots =
    selectedService &&
    selectedDate
      ? getAvailableTimeSlots(
          selectedDate,
          selectedService.durationMinutes
        )
      : [];

  /**
   * =========================================================
   * CONSULTAR DISPONIBILIDAD
   * =========================================================
   */

  useEffect(() => {
    if (
      !selectedDate ||
      !selectedService
    ) {
      return;
    }

    let cancelled = false;

    const loadAvailability =
      async () => {
        try {
          setLoadingAvailability(
            true
          );

          const data =
            await getAvailability({
              date: selectedDate,
              serviceId:
                selectedService.id,
              serviceDuration:
                selectedService.durationMinutes,
            });

          if (!cancelled) {
            setAvailability(
              data || {}
            );
          }
        } catch (error) {
          console.error(
            "Error consultando disponibilidad:",
            error
          );

          if (!cancelled) {
            setAvailability({});
          }
        } finally {
          if (!cancelled) {
            setLoadingAvailability(
              false
            );
          }
        }
      };

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [
    selectedDate,
    selectedService,
  ]);

  /**
   * =========================================================
   * CONVERTIR HH:mm A MINUTOS
   * =========================================================
   */

  const timeToMinutes = (
    time
  ) => {
    const [
      hours,
      minutes,
    ] = time.split(":").map(Number);

    return (
      hours * 60 +
      minutes
    );
  };

  /**
   * =========================================================
   * DISPONIBILIDAD DE BARBERO
   * =========================================================
   */

  const isBarberAvailable = (
    barberName,
    startTime
  ) => {
    if (
      !selectedService ||
      !startTime
    ) {
      return false;
    }

    const reservations =
      availability[
        barberName
      ] || [];

    const endTime =
      calculateEndTime(
        startTime,
        selectedService.durationMinutes
      );

    const startMinutes =
      timeToMinutes(
        startTime
      );

    const endMinutes =
      timeToMinutes(
        endTime
      );

    return !reservations.some(
      (reservation) => {
        const reservationStart =
          timeToMinutes(
            reservation.startTime
          );

        const reservationEnd =
          timeToMinutes(
            reservation.endTime
          );

        return (
          startMinutes <
            reservationEnd &&
          endMinutes >
            reservationStart
        );
      }
    );
  };

  /**
   * =========================================================
   * BARBEROS DISPONIBLES PARA EL HORARIO SELECCIONADO
   * =========================================================
   */

  const getAvailableBarbersForTime =
    (time) => {
      if (!time) {
        return [];
      }

      return barbers.filter(
        (barber) =>
          barber.name !==
            "Cualquiera disponible" &&
          isBarberAvailable(
            barber.name,
            time
          )
      );
    };

  /**
   * =========================================================
   * CAMBIO DE FECHA
   * =========================================================
   */

  const handleDateChange = (
    e
  ) => {
    setSelectedDate(
      e.target.value
    );

    setSelectedTime("");

    setSelectedBarber("");
  };

  /**
   * =========================================================
   * CAMBIO DE TELÉFONO
   * =========================================================
   */

  const handlePhoneChange = (
    e
  ) => {
    setClientPhone(
      sanitizePhoneNumber(
        e.target.value
      )
    );
  };

  /**
   * =========================================================
   * SELECCIÓN DE HORARIO
   * =========================================================
   *
   * Cuando el cliente selecciona un horario,
   * buscamos automáticamente un barbero disponible.
   */

  const handleTimeChange = (
    time
  ) => {
    setSelectedTime(time);

    const availableBarbers =
      getAvailableBarbersForTime(
        time
      );

    if (
      availableBarbers.length > 0
    ) {
      /**
       * Si ya había un barbero elegido
       * y sigue libre, lo mantenemos.
       */
      const currentBarberAvailable =
        availableBarbers.some(
          (barber) =>
            barber.name ===
            selectedBarber
        );

      if (
        currentBarberAvailable
      ) {
        return;
      }

      /**
       * Si no, tomamos el primero
       * disponible.
       */
      setSelectedBarber(
        availableBarbers[0].name
      );

      return;
    }

    setSelectedBarber("");
  };

  /**
   * =========================================================
   * SELECCIÓN DE BARBERO
   * =========================================================
   */

  const handleBarberChange = (
    barberName
  ) => {
    /**
     * Cualquiera disponible
     */
    if (
      barberName ===
      "Cualquiera disponible"
    ) {
      if (!selectedTime) {
        setSelectedBarber(
          barberName
        );

        return;
      }

      const availableBarbers =
        getAvailableBarbersForTime(
          selectedTime
        );

      if (
        availableBarbers.length ===
        0
      ) {
        return;
      }

      setSelectedBarber(
        availableBarbers[0].name
      );

      return;
    }

    /**
     * Barbero específico
     */
    if (
      selectedTime &&
      !isBarberAvailable(
        barberName,
        selectedTime
      )
    ) {
      alert(
        "Ese barbero no está disponible para ese horario."
      );

      return;
    }

    setSelectedBarber(
      barberName
    );
  };

  /**
   * =========================================================
   * PASO 1 → PASO 2
   * =========================================================
   */

  const handleContinue =
    () => {
      if (!selectedTime) {
        return;
      }

      /**
       * Si no hay barbero seleccionado,
       * asignamos uno disponible automáticamente.
       */
      if (!selectedBarber) {
        const availableBarbers =
          getAvailableBarbersForTime(
            selectedTime
          );

        if (
          availableBarbers.length ===
          0
        ) {
          alert(
            "No hay barberos disponibles para ese horario."
          );

          return;
        }

        setSelectedBarber(
          availableBarbers[0].name
        );
      }

      /**
       * Si por alguna razón el barbero
       * seleccionado dejó de estar disponible,
       * buscamos otro automáticamente.
       */
      if (
        selectedBarber &&
        selectedBarber !==
          "Cualquiera disponible" &&
        !isBarberAvailable(
          selectedBarber,
          selectedTime
        )
      ) {
        const availableBarbers =
          getAvailableBarbersForTime(
            selectedTime
          );

        if (
          availableBarbers.length ===
          0
        ) {
          alert(
            "Ese horario ya no está disponible."
          );

          setSelectedTime("");

          return;
        }

        setSelectedBarber(
          availableBarbers[0].name
        );
      }

      setStep(2);
    };

  /**
   * =========================================================
   * CONFIRMAR RESERVA
   * =========================================================
   */

  const handleConfirmBooking =
    async () => {
      if (
        !selectedService ||
        !selectedDate ||
        !selectedTime ||
        !selectedBarber ||
        !clientName.trim() ||
        !clientPhone
      ) {
        alert(
          "Completá todos los datos antes de confirmar."
        );

        return;
      }

      setIsSubmitting(true);

      const endTime =
        calculateEndTime(
          selectedTime,
          selectedService.durationMinutes
        );

      try {
        /**
         * =====================================================
         * SEGUNDA VALIDACIÓN DE DISPONIBILIDAD
         * =====================================================
         *
         * Volvemos a consultar antes de guardar.
         *
         * Esto evita reservar un horario que alguien
         * haya ocupado mientras el cliente completaba
         * sus datos.
         */

        const freshAvailability =
          await getAvailability({
            date: selectedDate,
            serviceId:
              selectedService.id,
            serviceDuration:
              selectedService.durationMinutes,
          });

        const barberReservations =
          freshAvailability[
            selectedBarber
          ] || [];

        const startMinutes =
          timeToMinutes(
            selectedTime
          );

        const endMinutes =
          timeToMinutes(
            endTime
          );

        const conflict =
          barberReservations.some(
            (reservation) => {
              const reservationStart =
                timeToMinutes(
                  reservation.startTime
                );

              const reservationEnd =
                timeToMinutes(
                  reservation.endTime
                );

              return (
                startMinutes <
                  reservationEnd &&
                endMinutes >
                  reservationStart
              );
            }
          );

        /**
         * El horario fue ocupado
         * antes de confirmar.
         */
        if (conflict) {
          alert(
            "Ese horario acaba de ser ocupado. Elegí otro horario."
          );

          setSelectedTime("");
          setSelectedBarber("");
          setStep(1);

          return;
        }

        /**
         * =====================================================
         * GUARDAR RESERVA
         * =====================================================
         */

        await createAppointment({
          barberName:
            selectedBarber,

          serviceId:
            selectedService.id,

          serviceName:
            selectedService.name,

          clientName:
            clientName.trim(),

          clientPhone,

          date:
            selectedDate,

          startTime:
            selectedTime,

          endTime,

          price:
            selectedService.price,

          durationMinutes:
            selectedService.durationMinutes,
        });

        /**
         * =====================================================
         * WHATSAPP
         * =====================================================
         */

        const phoneNumber =
          "5491140311401";

        const browsNote =
          selectedService.includesBrows
            ? " (¡Cejas bonificadas!)"
            : "";

        const text =
          `¡Hola Elam Barber Studio! Quiero confirmar mi turno:\n\n` +
          `✂️ Servicio: ${selectedService.name}${browsNote}\n` +
          `👤 Barbero: ${selectedBarber}\n` +
          `📅 Fecha: ${selectedDate}\n` +
          `⏰ Horario: ${selectedTime} a ${endTime} hs\n` +
          `👤 Nombre: ${clientName}\n` +
          `📞 Teléfono: ${clientPhone}\n` +
          `💰 Total: $${formatPrice(
            selectedService.price
          )}\n\n` +
          `¡Muchas gracias!`;

        const waUrl =
          `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
            text
          )}`;

        window.location.href =
          waUrl;
      } catch (error) {
        console.error(
          "Error al registrar turno:",
          error
        );

        alert(
          error.message ||
            "No se pudo registrar la reserva. Verificá tu conexión o reintentá."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  /**
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <section className="min-h-screen bg-[#0B0B0B] px-6 py-32 text-center text-white">
        <p className="text-[#DDC88A]">
          Cargando datos de la agenda...
        </p>
      </section>
    );
  }

  /**
   * =========================================================
   * SERVICIO NO ENCONTRADO
   * =========================================================
   */

  if (!selectedService) {
    return (
      <section className="min-h-screen bg-[#0B0B0B] px-6 py-32 text-center text-white">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl font-semibold">
            Primero elegí un servicio
          </h1>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/#servicios"
              )
            }
            className="mt-8 rounded-full bg-[#DDC88A] px-6 py-3 text-sm font-bold text-[#0B0B0B]"
          >
            Ver servicios
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#0B0B0B] px-4 py-20 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-[#DDC88A]">
            Elam Barber Studio
          </span>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Reservá tu turno
          </h1>
        </div>

        {/* CONTAINER */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

          {/* RESUMEN DEL SERVICIO SELECCIONADO */}
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

                        {selectedService.includesBrows && (
                          <span className="ml-2 font-medium text-[#DDC88A]">
                            • Cejas incluidas
                          </span>
                        )}
                      </p>
                    </div>

                  </div>
                </div>

                <div className="text-2xl font-semibold text-[#DDC88A]">
                  $
                  {formatPrice(
                    selectedService.price
                  )}
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/#servicios"
                  )
                }
                className="mt-4 text-xs text-white/40 hover:text-[#DDC88A]"
              >
                Cambiar servicio
              </button>
            </div>
          </div>

          {/* STEPPER NAV */}
          <div className="border-b border-white/10 px-5 py-6">

            <div className="mx-auto flex max-w-2xl items-center justify-between">

              {STEPS.map(
                (item, index) => {
                  const isActive =
                    step ===
                    item.number;

                  const isCompleted =
                    step >
                    item.number;

                  return (
                    <div
                      key={
                        item.number
                      }
                      className="flex min-w-0 flex-1 items-center"
                    >

                      <div className="flex flex-col items-center">

                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold ${
                            isCompleted
                              ? "border-[#DDC88A] bg-[#DDC88A] text-[#0B0B0B]"
                              : isActive
                                ? "border-[#DDC88A] bg-[#DDC88A]/10 text-[#DDC88A]"
                                : "border-white/10 bg-white/[0.03] text-white/30"
                          }`}
                        >
                          {isCompleted ? (
                            <FaCheck />
                          ) : (
                            item.number
                          )}
                        </div>

                        <span className="mt-2 hidden text-[10px] uppercase sm:block">
                          {item.title}
                        </span>

                      </div>

                      {index <
                        STEPS.length -
                          1 && (
                        <div
                          className={`mx-3 h-px flex-1 ${
                            step >
                            item.number
                              ? "bg-[#DDC88A]"
                              : "bg-white/10"
                          }`}
                        />
                      )}

                    </div>
                  );
                }
              )}

            </div>

          </div>

          {/* PASO 1 - BARBERO, FECHA Y HORA */}
          {step === 1 && (
            <div className="p-5 sm:p-8 lg:p-10">

              <h2 className="text-2xl font-semibold">
                1. Selección de Barbero y Agenda
              </h2>

              {/* SELECCIÓN DE BARBERO */}
              <div className="mt-6 mb-8">

                <label className="mb-3 block text-sm font-medium text-white/70">
                  Elegí tu barbero
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                  {barbers.map(
                    (b) => {
                      const isAny =
                        b.name ===
                        "Cualquiera disponible";

                      const isBusy =
                        selectedTime &&
                        !isAny &&
                        !isBarberAvailable(
                          b.name,
                          selectedTime
                        );

                      return (
                        <button
                          key={
                            b.id
                          }
                          type="button"
                          disabled={
                            Boolean(
                              isBusy
                            )
                          }
                          onClick={() =>
                            handleBarberChange(
                              b.name
                            )
                          }
                          className={`flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition-all ${
                            selectedBarber ===
                            b.name
                              ? "border-[#DDC88A] bg-[#DDC88A]/10 text-[#DDC88A]"
                              : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/30"
                          } ${
                            isBusy
                              ? "cursor-not-allowed opacity-30"
                              : ""
                          }`}
                        >
                          <FaUserTag className="text-base" />

                          {b.name}

                          {isBusy && (
                            <span className="ml-auto text-[10px] uppercase text-white/30">
                              Ocupado
                            </span>
                          )}
                        </button>
                      );
                    }
                  )}

                </div>
              </div>

              {/* SELECCIÓN DE FECHA */}
              <div className="mb-8">

                <label className="mb-3 block text-sm font-medium text-white/70">
                  Fecha del turno
                </label>

                <div className="relative">

                  <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-[#DDC88A]" />

                  <input
                    type="date"
                    min={
                      minDate
                    }
                    max={
                      maxDate
                    }
                    value={
                      selectedDate
                    }
                    onChange={
                      handleDateChange
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#111111] py-3 pl-11 pr-4 text-white outline-none focus:border-[#DDC88A]/60"
                  />

                </div>
              </div>

              {/* SELECCIÓN DE HORARIOS */}
              <div>

                <span className="mb-3 block text-sm font-medium text-white/70">
                  Horarios disponibles (10:00 a 20:00 hs)
                </span>

                {loadingAvailability ? (
                  <p className="text-sm text-white/40">
                    Consultando disponibilidad...
                  </p>
                ) : availableSlots.length >
                  0 ? (

                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">

                    {availableSlots.map(
                      (time) => {
                        const availableBarbers =
                          getAvailableBarbersForTime(
                            time
                          );

                        const hasAvailableBarber =
                          availableBarbers.length >
                          0;

                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={
                              !hasAvailableBarber
                            }
                            onClick={() =>
                              handleTimeChange(
                                time
                              )
                            }
                            className={`rounded-xl border py-3 text-sm font-semibold ${
                              selectedTime ===
                              time
                                ? "border-[#DDC88A] bg-[#DDC88A] text-[#0B0B0B]"
                                : "border-white/10 bg-white/[0.03] text-white/70 hover:border-[#DDC88A]/40"
                            } ${
                              !hasAvailableBarber
                                ? "cursor-not-allowed opacity-20"
                                : ""
                            }`}
                          >
                            {time}
                          </button>
                        );
                      }
                    )}

                  </div>

                ) : (

                  <p className="text-sm text-white/40">
                    No hay horarios disponibles para esta fecha.
                  </p>

                )}

              </div>

              <button
                type="button"
                disabled={
                  !selectedTime
                }
                onClick={
                  handleContinue
                }
                className="mt-8 w-full rounded-xl bg-[#DDC88A] py-4 text-sm font-bold text-[#0B0B0B] disabled:opacity-30"
              >
                Continuar
              </button>

            </div>
          )}

          {/* PASO 2 - DATOS CLIENTE */}
          {step === 2 && (
            <div className="p-5 sm:p-8 lg:p-10">

              <button
                type="button"
                onClick={() =>
                  setStep(1)
                }
                className="mb-6 inline-flex items-center gap-2 text-sm text-white/40"
              >
                <FaArrowLeft /> Volver
              </button>

              <h2 className="text-2xl font-semibold">
                2. Completá tus datos
              </h2>

              <div className="mt-6 space-y-5">

                <div>

                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Nombre completo
                  </label>

                  <input
                    type="text"
                    value={
                      clientName
                    }
                    onChange={(e) =>
                      setClientName(
                        e.target.value
                      )
                    }
                    placeholder="Ej: Juan Pérez"
                    className="w-full rounded-xl border border-white/10 bg-[#111111] py-3 px-4 text-white outline-none focus:border-[#DDC88A]"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Teléfono / WhatsApp
                  </label>

                  <input
                    type="text"
                    value={
                      clientPhone
                    }
                    onChange={
                      handlePhoneChange
                    }
                    placeholder="Ej: 1123456789"
                    className="w-full rounded-xl border border-white/10 bg-[#111111] py-3 px-4 text-white outline-none focus:border-[#DDC88A]"
                  />

                </div>

              </div>

              <button
                type="button"
                disabled={
                  !clientName.trim() ||
                  clientPhone.length <
                    8
                }
                onClick={() =>
                  setStep(3)
                }
                className="mt-8 w-full rounded-xl bg-[#DDC88A] py-4 text-sm font-bold text-[#0B0B0B] disabled:opacity-30"
              >
                Revisar reserva
              </button>

            </div>
          )}

          {/* PASO 3 - CONFIRMACIÓN */}
          {step === 3 && (
            <div className="p-5 sm:p-8 lg:p-10">

              <button
                type="button"
                onClick={() =>
                  setStep(2)
                }
                className="mb-6 inline-flex items-center gap-2 text-sm text-white/40"
              >
                <FaArrowLeft /> Volver
              </button>

              <h2 className="text-2xl font-semibold">
                3. Revisá tu reserva
              </h2>

              <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm">

                <div className="flex justify-between">
                  <span className="text-white/40">
                    Servicio
                  </span>

                  <strong>
                    {
                      selectedService.name
                    }
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/40">
                    Barbero
                  </span>

                  <strong>
                    {
                      selectedBarber
                    }
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-white/40">
                    Fecha
                  </span>

                  <strong>
                    {
                      selectedDate
                    }
                  </strong>
                </div>

                <div className="flex justify-between">

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

                <div className="flex justify-between">
                  <span className="text-white/40">
                    Cliente
                  </span>

                  <strong>
                    {
                      clientName
                    }
                  </strong>
                </div>

                <div className="flex justify-between border-t border-white/10 pt-4">

                  <span>Total</span>

                  <strong className="text-xl text-[#DDC88A]">
                    $
                    {formatPrice(
                      selectedService.price
                    )}
                  </strong>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  handleConfirmBooking
                }
                disabled={
                  isSubmitting
                }
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-[#076428] py-4 font-bold text-white hover:bg-[#087A31] disabled:opacity-50"
              >

                <FaWhatsapp className="text-lg" />

                {isSubmitting
                  ? "Guardando..."
                  : "Confirmar turno por WhatsApp"}

              </button>

            </div>
          )}

        </div>
      </div>
    </section>
  );
}
