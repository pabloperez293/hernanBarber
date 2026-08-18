/**
 * Obtiene los límites de fechas para el calendario de reservas
 * Mínimo: hoy, Máximo: 30 días desde hoy
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
 * Obtiene los horarios disponibles para una fecha y duración específica
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {number} durationMinutes - Duración del servicio en minutos
 * @returns {string[]} Array de horarios disponibles en formato HH:MM
 */
export function getAvailableTimeSlots(date, durationMinutes = 30) {
  // Horarios de apertura y cierre (puedes ajustar según necesidad)
  const openingTime = 9; // 9:00 AM
  const closingTime = 18; // 6:00 PM
  const slotDuration = 30; // Intervalo entre slots en minutos

  const slots = [];
  const duration = durationMinutes || 30;

  for (let hour = openingTime; hour < closingTime; hour++) {
    for (let minutes = 0; minutes < 60; minutes += slotDuration) {
      // Verificar que el servicio quepa antes del cierre
      const endTime = new Date(2000, 0, 1, hour, minutes + duration);
      if (endTime.getHours() < closingTime || (endTime.getHours() === closingTime && endTime.getMinutes() === 0)) {
        const timeString = `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        slots.push(timeString);
      }
    }
  }

  return slots;
}

/**
 * Calcula la hora de fin basada en la hora de inicio y duración
 * @param {string} startTime - Hora de inicio en formato HH:MM
 * @param {number} durationMinutes - Duración en minutos
 * @returns {string} Hora de fin en formato HH:MM
 */
export function calculateEndTime(startTime, durationMinutes) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  date.setMinutes(date.getMinutes() + durationMinutes);

  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/**
 * Sanitiza un número de teléfono removiendo caracteres no numéricos
 * @param {string} phone - Número de teléfono
 * @returns {string} Número de teléfono sanitizado
 */
export function sanitizePhoneNumber(phone) {
  return phone.replace(/\D/g, "");
}
