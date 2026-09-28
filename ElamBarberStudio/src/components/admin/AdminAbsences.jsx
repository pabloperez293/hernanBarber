import { useCallback, useEffect, useRef, useState } from "react";

import { FaExclamationTriangle, FaTrash, FaWhatsapp } from "react-icons/fa";

import {
  createAbsence,
  deleteAbsence,
  listAbsences,
} from "../../utils/adminApi";
import { formatDateLocal } from "../../utils/bookingUtils";

import {
  BARBER_NAMES,
  CLOSE_TIME,
  OPEN_TIME,
  TIME_OPTIONS,
  formatDateLabel,
  ghostButtonClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  whatsappLink,
} from "./adminShared";

const buildInitialForm = () => ({
  barberName: BARBER_NAMES[0],
  dateFrom: formatDateLocal(new Date()),
  dateTo: "",
  allDay: false,
  startTime: "13:00",
  endTime: "15:00",
  reason: "",
});

export default function AdminAbsences() {
  const [form, setForm] = useState(buildInitialForm);
  const [absences, setAbsences] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [conflicts, setConflicts] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submitLock = useRef(false);

  const today = formatDateLocal(new Date());

  const loadAbsences = useCallback(async () => {
    try {
      const result = await listAbsences({ from: today });

      setAbsences(result.absences || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingList(false);
    }
  }, [today]);

  useEffect(() => {
    loadAbsences();
  }, [loadAbsences]);

  const updateForm = (changes) => {
    setForm((current) => ({ ...current, ...changes }));
    setConflicts(null);
    setSuccess("");
    setError("");
  };

  const validate = () => {
    if (!form.dateFrom) {
      return "Elegí la fecha de la ausencia.";
    }

    if (form.dateTo && form.dateTo < form.dateFrom) {
      return "La fecha final no puede ser anterior a la inicial.";
    }

    if (!form.allDay && form.endTime <= form.startTime) {
      return "La hora final tiene que ser posterior a la inicial.";
    }

    return "";
  };

  const submit = async (confirmConflicts = false) => {
    if (submitLock.current) return;

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    submitLock.current = true;
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const result = await createAbsence({
        barberName: form.barberName,
        dateFrom: form.dateFrom,
        dateTo: form.dateTo || form.dateFrom,
        allDay: form.allDay,
        startTime: form.startTime,
        endTime: form.endTime,
        reason: form.reason.trim(),
        confirmConflicts,
      });

      // Hay clientes con turno en ese rango: pedimos confirmación.
      if (result.needsConfirmation) {
        setConflicts(result.conflicts || []);
        return;
      }

      setConflicts(null);
      setSuccess(
        result.conflicts?.length
          ? `${result.message} Recordá avisar a los clientes que ya tenían turno.`
          : result.message
      );

      await loadAbsences();
    } catch (err) {
      setError(err.message);
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const handleDelete = async (absence) => {
    if (deletingId) return;

    const confirmed = window.confirm(
      `¿Eliminar la ausencia de ${absence.barberName} del ${formatDateLabel(
        absence.date
      )}? El horario volverá a estar disponible.`
    );

    if (!confirmed) return;

    setDeletingId(absence.id);
    setError("");

    try {
      await deleteAbsence(absence.id);
      await loadAbsences();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold">Ausencias</h2>

      <p className="mt-2 text-sm text-white/40">
        Los horarios que cargues acá se bloquean automáticamente en la
        reserva online.
      </p>

      {/* FORMULARIO */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Barbero</label>

          <div className="grid grid-cols-2 gap-3">
            {BARBER_NAMES.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => updateForm({ barberName: name })}
                className={`rounded-xl border p-4 text-sm font-semibold transition-all ${
                  form.barberName === name
                    ? "border-[#DDC88A] bg-[#DDC88A]/10 text-[#DDC88A]"
                    : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/30"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Fecha</label>

          <input
            type="date"
            min={today}
            value={form.dateFrom}
            onChange={(e) => updateForm({ dateFrom: e.target.value })}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            Hasta el día{" "}
            <span className="text-white/30">(opcional, varios días)</span>
          </label>

          <input
            type="date"
            min={form.dateFrom || today}
            value={form.dateTo}
            onChange={(e) => updateForm({ dateTo: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              checked={form.allDay}
              onChange={(e) => updateForm({ allDay: e.target.checked })}
              className="h-4 w-4 accent-[#DDC88A]"
            />
            Todo el día ({OPEN_TIME} a {CLOSE_TIME} hs)
          </label>
        </div>

        {!form.allDay && (
          <>
            <div>
              <label className={labelClass}>Desde</label>

              <select
                value={form.startTime}
                onChange={(e) => updateForm({ startTime: e.target.value })}
                className={inputClass}
              >
                {TIME_OPTIONS.slice(0, -1).map((time) => (
                  <option key={time} value={time}>
                    {time} hs
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Hasta</label>

              <select
                value={form.endTime}
                onChange={(e) => updateForm({ endTime: e.target.value })}
                className={inputClass}
              >
                {TIME_OPTIONS.slice(1).map((time) => (
                  <option key={time} value={time}>
                    {time} hs
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label className={labelClass}>
            Motivo <span className="text-white/30">(opcional, solo lo ves vos)</span>
          </label>

          <input
            type="text"
            value={form.reason}
            onChange={(e) => updateForm({ reason: e.target.value })}
            placeholder="Ej: Trámite, médico, vacaciones"
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl border border-[#DDC88A]/20 bg-[#DDC88A]/5 p-4 text-sm text-[#DDC88A]">
          {success}
        </div>
      )}

      {/* CONFLICTOS CON TURNOS YA RESERVADOS */}
      {conflicts && (
        <div className="mt-5 rounded-2xl border border-[#DDC88A]/30 bg-[#DDC88A]/5 p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#DDC88A]">
            <FaExclamationTriangle />
            Ya hay {conflicts.length}{" "}
            {conflicts.length === 1 ? "turno reservado" : "turnos reservados"}{" "}
            en ese rango
          </p>

          <p className="mt-2 text-xs text-white/50">
            Si bloqueás igual, esos turnos no se cancelan solos. Avisales a
            los clientes para reprogramar.
          </p>

          <ul className="mt-4 space-y-2">
            {conflicts.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#111111] p-3 text-sm"
              >
                <span>
                  <strong>{item.clientName}</strong>
                  <span className="ml-2 text-white/40">
                    {formatDateLabel(item.date)} · {item.startTime} -{" "}
                    {item.endTime}
                  </span>
                </span>

                <a
                  href={whatsappLink(
                    item.clientPhone,
                    `Hola ${item.clientName}! Te escribimos de Elam Barber Studio: tenemos que reprogramar tu turno del ${formatDateLabel(
                      item.date
                    )} a las ${item.startTime}. ¿Qué otro horario te queda bien?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp de ${item.clientName}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all hover:border-[#DDC88A]/40 hover:text-[#DDC88A]"
                >
                  <FaWhatsapp />
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={submitting}
              onClick={() => submit(true)}
              className={primaryButtonClass}
            >
              {submitting ? "Guardando..." : "Bloquear igual"}
            </button>

            <button
              type="button"
              onClick={() => setConflicts(null)}
              className={ghostButtonClass}
            >
              Volver
            </button>
          </div>
        </div>
      )}

      {!conflicts && (
        <button
          type="button"
          disabled={submitting}
          onClick={() => submit(false)}
          className={`${primaryButtonClass} mt-6 w-full py-4`}
        >
          {submitting ? "Guardando..." : "Bloquear horario"}
        </button>
      )}

      {/* AUSENCIAS PRÓXIMAS */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold">Próximas ausencias</h3>

        {loadingList ? (
          <p className="mt-4 text-sm text-white/40">Cargando...</p>
        ) : absences.length === 0 ? (
          <p className="mt-4 text-sm text-white/40">
            No hay ausencias cargadas.
          </p>
        ) : (
          <ul className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {absences.map((absence) => {
              const isAllDay =
                absence.startTime === OPEN_TIME &&
                absence.endTime === CLOSE_TIME;

              return (
                <li
                  key={absence.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {absence.barberName}
                      <span className="ml-2 font-normal capitalize text-white/40">
                        {formatDateLabel(absence.date)}
                      </span>
                    </p>

                    <p className="mt-1 text-xs text-[#DDC88A]">
                      {isAllDay
                        ? "Todo el día"
                        : `${absence.startTime} - ${absence.endTime} hs`}

                      {absence.reason && (
                        <span className="ml-2 text-white/40">
                          · {absence.reason}
                        </span>
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Eliminar ausencia"
                    disabled={deletingId === absence.id}
                    onClick={() => handleDelete(absence)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-red-400/40 hover:text-red-300 disabled:opacity-40"
                  >
                    <FaTrash />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
