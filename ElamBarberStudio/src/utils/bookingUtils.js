const START_HOUR = 10;
const END_HOUR = 20;
const SLOT_INTERVAL = 30;

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

export function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getAvailableTimeSlots(
  selectedDateStr,
  durationMinutes = 45
) {
  if (!selectedDateStr) {
    return [];
  }

  const [year, month, day] = selectedDateStr
    .split("-")
    .map(Number);

  const selectedDate = new Date(
    year,
    month - 1,
    day
  );

  // Domingo cerrado
  if (selectedDate.getDay() === 0) {
    return [];
  }

  const slots = [];

  const today = new Date();
  const todayStr = formatDateLocal(today);

  const isToday = selectedDateStr === todayStr;

  const currentMinutes =
    today.getHours() * 60 + today.getMinutes();

  const openingMinutes = START_HOUR * 60;
  const closingMinutes = END_HOUR * 60;

  for (
    let slotStartMinutes = openingMinutes;
    slotStartMinutes < closingMinutes;
    slotStartMinutes += SLOT_INTERVAL
  ) {
    // El turno debe terminar antes o exactamente a las 20:00
    if (
      slotStartMinutes + durationMinutes >
      closingMinutes
    ) {
      continue;
    }

    // Si es hoy, no mostrar horarios que ya pasaron
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

export function calculateEndTime(
  startTimeStr,
  durationMinutes
) {
  if (!startTimeStr) {
    return "";
  }

  const [hours, minutes] =
    startTimeStr.split(":").map(Number);

  const totalMinutes =
    hours * 60 +
    minutes +
    durationMinutes;

  const endHours =
    Math.floor(totalMinutes / 60);

  const endMinutes =
    totalMinutes % 60;

  return (
    `${String(endHours).padStart(2, "0")}:` +
    `${String(endMinutes).padStart(2, "0")}`
  );
}

export function timeToMinutes(time) {
  if (!time) {
    return 0;
  }

  const [hours, minutes] =
    time.split(":").map(Number);

  return hours * 60 + minutes;
}

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

export function sanitizePhoneNumber(phone) {
  return phone.replace(/\D/g, "");
}