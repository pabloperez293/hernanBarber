import { BARBERS_MOCK, SERVICES_MOCK } from "../data/mockData";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";

const LOCAL_STORAGE_KEY = "elam_barber_reservations";

/**
 * ============================================================
 * CONFIGURACIÓN
 * ============================================================
 *
 * Si VITE_GOOGLE_SCRIPT_URL existe:
 *   React utilizará Google Apps Script.
 *
 * Si no existe:
 *   utilizará localStorage para poder probar el sistema
 *   mientras desarrollamos la integración con Google Sheets.
 *
 * Esto permite que el proyecto siga funcionando en Netlify
 * aunque todavía no esté configurado Google Apps Script.
 */

/**
 * Obtiene servicios.
 *
 * Por ahora utilizamos los datos del proyecto directamente.
 * Más adelante Google Sheets podrá administrar estos datos
 * si se desea.
 */
export async function getServices() {
  return SERVICES_MOCK;
}

/**
 * Obtiene barberos.
 */
export async function getBarbers() {
  return BARBERS_MOCK;
}

/**
 * Obtiene reservas almacenadas localmente.
 *
 * Esta función solamente se utiliza durante la Fase 1.
 */
function getLocalReservations() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Error leyendo reservas locales:", error);
    return [];
  }
}

/**
 * Guarda una reserva localmente.
 *
 * Esto es únicamente para pruebas de la Fase 1.
 */
function saveLocalReservation(appointment) {
  const reservations = getLocalReservations();

  reservations.push(appointment);

  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(reservations)
  );
}

/**
 * Comprueba si dos intervalos horarios se superponen.
 *
 * Ejemplo:
 *
 * Reserva existente:
 * 10:00 - 11:00
 *
 * Nueva reserva:
 * 10:30 - 11:15
 *
 * Resultado:
 * TRUE → existe conflicto.
 */
function intervalsOverlap(
  startA,
  endA,
  startB,
  endB
) {
  const startAMinutes = timeToMinutes(startA);
  const endAMinutes = timeToMinutes(endA);

  const startBMinutes = timeToMinutes(startB);
  const endBMinutes = timeToMinutes(endB);

  return (
    startAMinutes < endBMinutes &&
    endAMinutes > startBMinutes
  );
}

/**
 * Convierte HH:mm a minutos.
 */
function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

/**
 * Obtiene disponibilidad.
 *
 * En Fase 1:
 *   - Si existe Google Apps Script → consulta Google.
 *   - Si no existe → consulta localStorage.
 */
export async function getAvailability({
  date,
  serviceId,
  serviceDuration,
}) {
  /**
   * ==========================================================
   * GOOGLE APPS SCRIPT
   * ==========================================================
   */
  if (GOOGLE_SCRIPT_URL) {
    const url = new URL(GOOGLE_SCRIPT_URL);

    url.searchParams.set("action", "availability");
    url.searchParams.set("date", date);
    url.searchParams.set("serviceId", String(serviceId));
    url.searchParams.set(
      "serviceDuration",
      String(serviceDuration)
    );

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        "No se pudo consultar la disponibilidad."
      );
    }

    return await response.json();
  }

  /**
   * ==========================================================
   * MODO LOCAL - FASE 1
   * ==========================================================
   */

  const reservations = getLocalReservations();

  const reservationsForDate = reservations.filter(
    (reservation) => reservation.date === date
  );

  const result = {};

  BARBERS_MOCK.forEach((barber) => {
    if (barber.name === "Cualquiera disponible") {
      return;
    }

    result[barber.name] = reservationsForDate
      .filter(
        (reservation) =>
          reservation.barberName === barber.name
      )
      .map((reservation) => ({
        startTime: reservation.startTime,
        endTime: reservation.endTime,
      }));
  });

  return result;
}

/**
 * Registra una reserva.
 *
 * En Fase 1:
 *   - Google Apps Script → Google Sheets.
 *   - Sin URL → localStorage.
 */
export async function createAppointment(appointment) {
  /**
   * ==========================================================
   * GOOGLE APPS SCRIPT
   * ==========================================================
   */
  if (GOOGLE_SCRIPT_URL) {
    const url = new URL(GOOGLE_SCRIPT_URL);

    url.searchParams.set("action", "createAppointment");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(appointment),
    });

    if (!response.ok) {
      throw new Error(
        "No se pudo registrar la reserva."
      );
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(
        result.message ||
          "La reserva no pudo ser registrada."
      );
    }

    return result;
  }

  /**
   * ==========================================================
   * MODO LOCAL - FASE 1
   * ==========================================================
   */

  const reservations = getLocalReservations();

  const hasConflict = reservations.some(
    (reservation) => {
      if (
        reservation.date !== appointment.date ||
        reservation.barberName !== appointment.barberName
      ) {
        return false;
      }

      return intervalsOverlap(
        appointment.startTime,
        appointment.endTime,
        reservation.startTime,
        reservation.endTime
      );
    }
  );

  if (hasConflict) {
    throw new Error(
      "Ese horario acaba de ser ocupado. Elegí otro horario."
    );
  }

  const newAppointment = {
    ...appointment,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };

  saveLocalReservation(newAppointment);

  return {
    success: true,
    appointmentId: newAppointment.id,
    local: true,
  };
}

/**
 * Comprueba si un barbero está disponible
 * para un determinado horario.
 */
export function isBarberAvailable({
  reservations,
  barberName,
  startTime,
  endTime,
}) {
  return !reservations.some(
    (reservation) =>
      reservation.barberName === barberName &&
      intervalsOverlap(
        startTime,
        endTime,
        reservation.startTime,
        reservation.endTime
      )
  );
}