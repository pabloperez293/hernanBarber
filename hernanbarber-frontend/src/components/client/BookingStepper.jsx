// src/components/client/BookingStepper.jsx
import React, { useState, useEffect } from "react";
import { SERVICES_MOCK } from "../../data/mockData";
import {
  getDateRangeLimits,
  getAvailableTimeSlots,
  calculateEndTime,
  sanitizePhoneNumber,
} from "../../utils/bookingUtils";
import {
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  ArrowLeft,
  Scissors,
} from "lucide-react";

export default function BookingStepper() {
  const [step, setStep] = useState(1);

  // Estados de la reserva
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Fechas límites para el calendario
  const { minDate, maxDate } = getDateRangeLimits();

  // Inicializar la fecha por defecto en hoy
  useEffect(() => {
    setSelectedDate(minDate);
  }, [minDate]);

  // Lista de horarios disponibles según fecha y servicio
  const availableSlots =
    selectedService && selectedDate
      ? getAvailableTimeSlots(selectedDate, selectedService.durationMinutes)
      : [];

  // Resetear hora elegida si cambia la fecha o el servicio
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedTime("");
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedTime("");
    setStep(2);
  };

  // Sanitización de teléfono en vivo (solo números)
  const handlePhoneChange = (e) => {
    const cleanValue = sanitizePhoneNumber(e.target.value);
    setClientPhone(cleanValue);
  };

  // Generación de link de WhatsApp para confirmación instantánea
  const getWhatsAppLink = () => {
    const phoneNumber = "5491112345678"; // Reemplazar por el WhatsApp del barbero Hernán
    const endTime = calculateEndTime(
      selectedTime,
      selectedService.durationMinutes,
    );
    const text =
      `¡Hola Hernán! Quiero confirmar mi turno:\n\n` +
      `✂️ *Servicio:* ${selectedService.name}\n` +
      `📅 *Fecha:* ${selectedDate}\n` +
      `⏰ *Horario:* ${selectedTime} a ${endTime} hs\n` +
      `👤 *Nombre:* ${clientName}\n` +
      `📞 *Teléfono:* ${clientPhone}\n\n` +
      `¡Muchas gracias!`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 text-slate-100 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 my-8 p-6">
      {/* Encabezado e Identidad */}
      <div className="text-center mb-8 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mb-3">
          <Scissors className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          HernanBarber
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Reserva tu turno en simples pasos
        </p>
      </div>

      {/* Indicador de Pasos (Stepper Header) */}
      <div className="flex items-center justify-between mb-8 px-4">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step >= num
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-800 text-slate-500"
              }`}
            >
              {num}
            </div>
            {num < 3 && (
              <div
                className={`w-12 sm:w-24 h-1 mx-2 transition-colors ${
                  step > num ? "bg-amber-500" : "bg-slate-800"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* PASO 1: SELECCIÓN DE SERVICIO */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-amber-400">
            1. Seleccioná un servicio
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {SERVICES_MOCK.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                  selectedService?.id === service.id
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-slate-800 bg-slate-800/50 hover:border-slate-700"
                }`}
              >
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {service.name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {service.description}
                  </p>
                  <span className="inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-amber-400">
                    ⏱️ {service.durationMinutes} min
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-white">
                    ${service.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PASO 2: SELECCIÓN DE FECHA Y HORA */}
      {step === 2 && (
        <div>
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Servicios
          </button>

          <h2 className="text-xl font-bold mb-4 text-amber-400">
            2. Elege Fecha y Hora
          </h2>

          {/* Selector de Fecha */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Fecha del turno:
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Solo disponible para el mes en curso.
            </p>
          </div>

          {/* Selector de Horarios Disponibles */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Horarios disponibles:
            </label>
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 rounded-lg font-semibold text-sm border transition-all ${
                      selectedTime === time
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    {time} hs
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-xl text-center text-sm">
                No hay horarios disponibles para la fecha seleccionada. Probá
                con otro día.
              </div>
            )}
          </div>

          <button
            disabled={!selectedTime}
            onClick={() => setStep(3)}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold py-3 rounded-xl transition-all"
          >
            Continuar a tus datos
          </button>
        </div>
      )}

      {/* PASO 3: DATOS Y CONFIRMACIÓN */}
      {step === 3 && (
        <div>
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Fecha y Hora
          </button>

          <h2 className="text-xl font-bold mb-4 text-amber-400">
            3. Tus Datos
          </h2>

          {/* Resumen del Turno */}
          <div className="bg-slate-800/80 rounded-xl p-4 mb-6 border border-slate-700/50 space-y-2 text-sm">
            <p className="flex justify-between text-slate-300">
              <span>Servicio:</span>{" "}
              <strong className="text-white">{selectedService.name}</strong>
            </p>
            <p className="flex justify-between text-slate-300">
              <span>Fecha:</span>{" "}
              <strong className="text-white">{selectedDate}</strong>
            </p>
            <p className="flex justify-between text-slate-300">
              <span>Horario:</span>
              <strong className="text-amber-400">
                {selectedTime} hs -{" "}
                {calculateEndTime(
                  selectedTime,
                  selectedService.durationMinutes,
                )}{" "}
                hs
              </strong>
            </p>
            <p className="flex justify-between text-slate-300 pt-2 border-t border-slate-700">
              <span>Total a pagar:</span>{" "}
              <strong className="text-white text-base">
                ${selectedService.price}
              </strong>
            </p>
          </div>

          {/* Formulario */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">
                Nombre completo:
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ej: Matías"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">
                Teléfono (WhatsApp):
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ej: 1123456789 (solo números)"
                  value={clientPhone}
                  onChange={handlePhoneChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <a
            href={
              clientName && clientPhone.length >= 8 ? getWhatsAppLink() : "#"
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!clientName || clientPhone.length < 8) {
                e.preventDefault();
                alert("Por favor completá tu nombre y un teléfono válido.");
              }
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle className="w-5 h-5" />
            Confirmar turno por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
