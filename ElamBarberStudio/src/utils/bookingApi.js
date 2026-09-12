import { BARBERS_MOCK, SERVICES_MOCK } from "../data/mockData";

const GOOGLE_SCRIPT_URL =
  import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";

const GOOGLE_API_URL = import.meta.env.DEV
  ? "/google-api"
  : GOOGLE_SCRIPT_URL;

function timeToMinutes(time) {
  if (!time) return 0;

  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function intervalsOverlap(startA, endA, startB, endB) {
  return (
    timeToMinutes(startA) < timeToMinutes(endB) &&
    timeToMinutes(endA) > timeToMinutes(startB)
  );
}

function ensureGoogleScriptConfigured() {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error(
      "El sistema de reservas no está configurado correctamente."
    );
  }
}

export async function getServices() {
  return SERVICES_MOCK;
}

export async function getBarbers() {
  return BARBERS_MOCK;
}

export async function getAvailability({
  date,
  serviceId,
  serviceDuration,
}) {
  ensureGoogleScriptConfigured();

  const url = new URL(
  GOOGLE_API_URL,
  window.location.origin
);

  url.searchParams.set("action", "availability");
url.searchParams.set("date", date);
url.searchParams.set(
  "serviceId",
  String(serviceId)
);
url.searchParams.set(
  "serviceDuration",
  String(serviceDuration)
);
url.searchParams.set(
  "_cache",
  String(Date.now())
);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        "No se pudo consultar la disponibilidad."
      );
    }

    const result = await response.json();

    if (!result || typeof result !== "object") {
      throw new Error(
        "La respuesta de disponibilidad no es válida."
      );
    }

    return result;
  } catch (error) {
    console.error(
      "Error consultando disponibilidad:",
      error
    );

    throw new Error(
      "No se pudo consultar la disponibilidad. Intentá nuevamente."
    );
  }
}

export async function createAppointment(appointment) {
  ensureGoogleScriptConfigured();

  const url = new URL(
  GOOGLE_API_URL,
  window.location.origin
);

  url.searchParams.set("action", "createAppointment");

  try {
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
  } catch (error) {
    console.error(
      "Error registrando reserva:",
      error
    );

    if (
      error instanceof Error &&
      error.message &&
      !error.message.includes("Failed to fetch")
    ) {
      throw error;
    }

    throw new Error(
      "No se pudo registrar la reserva. Intentá nuevamente."
    );
  }
}

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