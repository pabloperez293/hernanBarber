// src/utils/bookingUtils.js

/**
 * Devuelve rango de reserva desde hoy hasta 30 días
 */
export function getDateRangeLimits() {
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const maxDateObj = new Date(today);
  maxDateObj.setDate(maxDateObj.getDate() + 30);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  return { minDate, maxDate };
}

/**
 * Horarios disponibles entre 10:00 y 20:00 hs
 */
export function getAvailableTimeSlots(selectedDateStr, durationMinutes = 45) {
  const slots = [];
  const startHour = 10; // 10:00 AM
  const endHour = 20;   // 20:00 PM

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const isToday = selectedDateStr === todayStr;

  let currentMinutes = today.getHours() * 60 + today.getMinutes();

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotStartMinutes = hour * 60 + minute;

      // Omitir si la duración sobrepasa las 20:00 hs
      if (slotStartMinutes + durationMinutes > endHour * 60) {
        continue;
      }

      // Si es hoy, omitir turnos pasados
      if (isToday && slotStartMinutes <= currentMinutes) {
        continue;
      }

      const formattedHour = String(hour).padStart(2, "0");
      const formattedMinute = String(minute).padStart(2, "0");
      slots.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  return slots;
}

/**
 * Calcula hora fin según la duración
 */
export function calculateEndTime(startTimeStr, durationMinutes) {
  if (!startTimeStr) return "";
  const [hours, minutes] = startTimeStr.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;

  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;

  return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
}

export function sanitizePhoneNumber(phone) {
  return phone.replace(/\D/g, "");
}