// src/utils/bookingUtils.js

// import
import { useEffect, useState } from "react";
import { FaArrowLeft, FaCalendarAlt, FaCheck, FaUserTag, FaWhatsapp } from "react-icons/fa";
import { FaScissors } from "react-icons/fa6";
import { getServices, getBarbers, getAvailability, createAppointment } from "./bookingApi";


/**
 * ============================================================
 * CONFIGURACIÓN DE AGENDA
 * ============================================================
 */

const START_HOUR = 10;
const END_HOUR = 20;
const SLOT_INTERVAL = 30;

/**
 * Devuelve el rango de fechas permitidas.
 *
 * Desde hoy hasta 30 días.
 */
export function getDateRangeLimits() {
  const today = new Date();

  const minDate = formatDateLocal(today);

  const maxDateObj = new Date(today);
  maxDateObj.setDate(maxDateObj.getDate() + 30);

  const maxDate = formatDateLocal(maxDateObj);

  return {
    minDate,
    maxDate,
  };
}

/**
 * Formatea una fecha utilizando la zona horaria local.
 *
 * Evita problemas producidos por toISOString()
 * cuando Argentina se encuentra detrás de UTC.
 */
export function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * ============================================================
 * HORARIOS
 * ============================================================
 *
 * Genera los horarios base de la agenda.
 *
 * Los turnos comienzan cada 30 minutos.
 *
 * Ejemplo:
 *
 * 10:00
 * 10:30
 * 11:00
 * 11:30
 * ...
 * 19:00
 *
 * La duración del servicio se utiliza para evitar
 * horarios cuyo final supere las 20:00.
 */
export function getAvailableTimeSlots(
  selectedDateStr,
  durationMinutes = 45
) {
  const slots = [];

  const today = new Date();
  const todayStr = formatDateLocal(today);

  const isToday =
    selectedDateStr === todayStr;

  const currentMinutes =
    today.getHours() * 60 +
    today.getMinutes();

  const openingMinutes =
    START_HOUR * 60;

  const closingMinutes =
    END_HOUR * 60;

  for (
    let slotStartMinutes = openingMinutes;
    slotStartMinutes < closingMinutes;
    slotStartMinutes += SLOT_INTERVAL
  ) {
    /**
     * El servicio no puede terminar después
     * del horario de cierre.
     */
    if (
      slotStartMinutes + durationMinutes >
      closingMinutes
    ) {
      continue;
    }

    /**
     * Si es hoy, no mostrar horarios que
     * ya comenzaron.
     */
    if (
      isToday &&
      slotStartMinutes <= currentMinutes
    ) {
      continue;
    }

    const hour = Math.floor(
      slotStartMinutes / 60
    );

    const minute =
      slotStartMinutes % 60;

    const formattedHour =
      String(hour).padStart(2, "0");

    const formattedMinute =
      String(minute).padStart(2, "0");

    slots.push(
      `${formattedHour}:${formattedMinute}`
    );
  }

  return slots;
}

/**
 * ============================================================
 * HORA DE FINALIZACIÓN
 * ============================================================
 */

export function calculateEndTime(
  startTimeStr,
  durationMinutes
) {
  if (!startTimeStr) {
    return "";
  }

  const [hours, minutes] =
    startTimeStr
      .split(":")
      .map(Number);

  const totalMinutes =
    hours * 60 +
    minutes +
    durationMinutes;

  const endHours =
    Math.floor(totalMinutes / 60);

  const endMinutes =
    totalMinutes % 60;

  return `${String(endHours).padStart(
    2,
    "0"
  )}:${String(endMinutes).padStart(
    2,
    "0"
  )}`;
}

/**
 * ============================================================
 * CONVERSIÓN DE HORARIOS
 * ============================================================
 */

export function timeToMinutes(time) {
  if (!time) {
    return 0;
  }

  const [hours, minutes] =
    time.split(":").map(Number);

  return (
    hours * 60 +
    minutes
  );
}

/**
 * Comprueba si dos reservas se superponen.
 */
export function intervalsOverlap(
  startA,
  endA,
  startB,
  endB
) {
  return (
    timeToMinutes(startA) <
      timeToMinutes(endB) &&
    timeToMinutes(endA) >
      timeToMinutes(startB)
  );
}

/**
 * ============================================================
 * TELÉFONO
 * ============================================================
 */

export function sanitizePhoneNumber(
  phone
) {
  return phone.replace(/\D/g, "");
}