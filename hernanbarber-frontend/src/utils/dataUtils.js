// src/utils/dateUtils.js

/**
 * Devuelve la fecha mínima (hoy) y máxima (último día del mes actual) en formato YYYY-MM-DD
 */
export const getDateRangeLimits = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Formato YYYY-MM-DD para hoy
  const minDate = today.toISOString().split('T')[0];

  // Último día del mes actual
  const lastDay = new Date(year, month + 1, 0);
  const maxDate = lastDay.toISOString().split('T')[0];

  return { minDate, maxDate };
};

/**
 * Genera los bloques de horarios disponibles (30 min) entre 09:00 y 20:00.
 * Si la fecha seleccionada es HOY, filtra horarios pasados y redondea la hora actual.
 */
export const getAvailableTimeSlots = (selectedDateStr, serviceDurationMinutes = 30) => {
  const slots = [];
  const startHour = 9;   // 09:00 AM
  const endHour = 20;    // 08:00 PM

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const isToday = selectedDateStr === todayStr;

  // Calcular hora actual redondeada al siguiente bloque de 30 min
  let currentRoundedMinutes = today.getHours() * 60 + today.getMinutes();
  if (isToday) {
    const remainder = currentRoundedMinutes % 30;
    if (remainder > 0) {
      currentRoundedMinutes += (30 - remainder); // Redondear hacia arriba
    }
  }

  // Generar slots de 30 min
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotTotalMinutes = hour * 60 + minute;

      // Verificar que el servicio no se pase de las 20:00 hs
      if (slotTotalMinutes + serviceDurationMinutes > endHour * 60) {
        continue;
      }

      // Si es hoy, omitir si es anterior a la hora actual redondeada
      if (isToday && slotTotalMinutes < currentRoundedMinutes) {
        continue;
      }

      const formattedHour = String(hour).padStart(2, '0');
      const formattedMinute = String(minute).padStart(2, '0');
      slots.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  return slots;
};

/**
 * Calcula la hora de finalización sumando la duración en minutos a la hora de inicio (HH:mm)
 */
export const calculateEndTime = (startTimeStr, durationMinutes) => {
  if (!startTimeStr) return '';
  const [hours, minutes] = startTimeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;

  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;

  return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
};

/**
 * Sanitizador para inputs de teléfono (solo números)
 */
export const sanitizePhoneNumber = (value) => {
  return value.replace(/\D/g, '');
};