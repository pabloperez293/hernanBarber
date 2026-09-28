import { useCallback, useEffect, useState } from "react";

import { FaChevronLeft, FaChevronRight, FaWhatsapp } from "react-icons/fa";

import { cancelAppointment, getAgenda } from "../../utils/adminApi";
import { formatDateLocal } from "../../utils/bookingUtils";

import {
  BARBER_NAMES,
  addDays,
  formatDateLabel,
  ghostButtonClass,
  inputClass,
  whatsappLink,
} from "./adminShared";

export default function AdminAgenda() {
  const [date, setDate] = useState(() => formatDateLocal(new Date()));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAgenda({ from: date, to: date });

      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (appointment) => {
    if (cancellingId) return;

    const confirmed = window.confirm(
      `¿Cancelar el turno de ${appointment.clientName} a las ${appointment.startTime}? El horario quedará libre.`
    );

    if (!confirmed) return;

    setCancellingId(appointment.id);

    try {
      await cancelAppointment(appointment.id);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId("");
    }
  };

  const appointments = (data?.appointments || []).filter(
    (item) => item.status !== "Cancelado"
  );

  const absences = data?.absences || [];

  return (
    <div>
      <h2 className="text-2xl font-semibold">Agenda del día</h2>

      {/* SELECTOR DE DÍA */}
      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          aria-label="Día anterior"
          onClick={() => setDate((current) => addDays(current, -1))}
          className={ghostButtonClass}
        >
          <FaChevronLeft />
        </button>

        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          className={`${inputClass} max-w-[220px]`}
        />

        <button
          type="button"
          aria-label="Día siguiente"
          onClick={() => setDate((current) => addDays(current, 1))}
          className={ghostButtonClass}
        >
          <FaChevronRight />
        </button>

        <span className="hidden text-sm capitalize text-white/40 sm:block">
          {formatDateLabel(date)}
        </span>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && !data ? (
        <p className="mt-8 text-sm text-white/40">Cargando...</p>
      ) : (
        <div
          className={`mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 ${
            loading ? "opacity-50 transition-opacity" : ""
          }`}
        >
          {BARBER_NAMES.map((barber) => {
            const barberAppointments = appointments.filter(
              (item) => item.barberName === barber
            );

            const barberAbsences = absences.filter(
              (item) => item.barberName === barber
            );

            const rows = [
              ...barberAppointments.map((item) => ({
                ...item,
                kind: "appointment",
              })),
              ...barberAbsences.map((item) => ({
                ...item,
                kind: "absence",
              })),
            ].sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div
                key={barber}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{barber}</h3>

                  <span className="text-xs uppercase tracking-[0.2em] text-white/30">
                    {barberAppointments.length}{" "}
                    {barberAppointments.length === 1 ? "turno" : "turnos"}
                  </span>
                </div>

                {rows.length === 0 ? (
                  <p className="mt-5 text-sm text-white/40">
                    Sin turnos para este día.
                  </p>
                ) : (
                  <ul className="mt-5 space-y-3">
                    {rows.map((row) =>
                      row.kind === "absence" ? (
                        <li
                          key={row.id}
                          className="rounded-xl border border-red-400/30 bg-red-400/5 p-4"
                        >
                          <p className="text-sm font-semibold text-red-300">
                            {row.startTime} - {row.endTime} · Ausente
                          </p>

                          {row.reason && (
                            <p className="mt-1 text-xs text-white/40">
                              {row.reason}
                            </p>
                          )}
                        </li>
                      ) : (
                        <li
                          key={row.id}
                          className="rounded-xl border border-white/10 bg-[#111111] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-[#DDC88A]">
                                {row.startTime} - {row.endTime}
                              </p>

                              <p className="mt-1 text-sm font-semibold">
                                {row.clientName}
                              </p>

                              <p className="text-xs text-white/40">
                                {row.serviceName}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={whatsappLink(row.clientPhone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`WhatsApp de ${row.clientName}`}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all hover:border-[#DDC88A]/40 hover:text-[#DDC88A]"
                              >
                                <FaWhatsapp />
                              </a>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={cancellingId === row.id}
                            onClick={() => handleCancel(row)}
                            className="mt-3 text-xs text-white/40 transition-colors hover:text-red-300 disabled:opacity-40"
                          >
                            {cancellingId === row.id
                              ? "Cancelando..."
                              : "Cancelar turno"}
                          </button>
                        </li>
                      )
                    )}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

