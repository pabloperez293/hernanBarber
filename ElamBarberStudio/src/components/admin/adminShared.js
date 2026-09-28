import { formatDateLocal } from "../../utils/bookingUtils";

export const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#111111] py-3 px-4 text-white outline-none focus:border-[#DDC88A]/60 [color-scheme:dark]";

export const labelClass =
  "mb-2 block text-sm font-medium text-white/70";

export const primaryButtonClass =
  "rounded-xl bg-[#DDC88A] px-6 py-3 text-sm font-bold text-[#0B0B0B] transition-all hover:bg-[#E6D49B] disabled:opacity-30";

export const ghostButtonClass =
  "rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/70 transition-all hover:border-[#DDC88A]/40 hover:text-[#DDC88A] disabled:opacity-30";

export const BARBER_NAMES = ["Javier", "Fabricio"];

export const OPEN_TIME = "10:00";
export const CLOSE_TIME = "20:00";

// Opciones cada 30 minutos entre apertura y cierre
export const TIME_OPTIONS = (() => {
  const options = [];

  for (let minutes = 10 * 60; minutes <= 20 * 60; minutes += 30) {
    const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
    const minute = String(minutes % 60).padStart(2, "0");

    options.push(`${hour}:${minute}`);
  }

  return options;
})();

export function parseIsoDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function addDays(iso, amount) {
  const date = parseIsoDate(iso);

  date.setDate(date.getDate() + amount);

  return formatDateLocal(date);
}

export function formatDateLabel(iso) {
  if (!iso) return "";

  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(parseIsoDate(iso));
}

export function getPresetRange(preset) {
  const today = new Date();
  const todayIso = formatDateLocal(today);

  if (preset === "hoy") {
    return { from: todayIso, to: todayIso };
  }

  if (preset === "semana") {
    // Semana de lunes a domingo
    const offset = (today.getDay() + 6) % 7;
    const monday = addDays(todayIso, -offset);

    return { from: monday, to: addDays(monday, 6) };
  }

  // mes
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    from: formatDateLocal(first),
    to: formatDateLocal(last),
  };
}

/**
 * Link de WhatsApp a partir del teléfono guardado en la hoja.
 * Los clientes cargan el número sin 0 ni 15 (ej: 1123456789).
 */
export function whatsappLink(phone, message = "") {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) return "";

  const full = digits.startsWith("54") ? digits : `549${digits}`;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";

  return `https://wa.me/${full}${text}`;
}
