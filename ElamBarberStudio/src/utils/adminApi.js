const GOOGLE_SCRIPT_URL =
  import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";

const GOOGLE_API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";

const TOKEN_KEY = "elam_admin_token";

export const ADMIN_LOGOUT_EVENT = "elam-admin-logout";

export function getStoredToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    // return "";
  }
}

function storeToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Si el navegador bloquea el storage, la sesión dura hasta recargar.
  }
}

function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nada que limpiar.
  }
}

/**
 * Todas las acciones de admin son POST (la clave y el token
 * nunca viajan en la URL). Se usa text/plain para evitar el
 * preflight CORS que Apps Script no soporta.
 */
async function adminRequest(action, payload = {}, { auth = true } = {}) {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error(
      "El sistema de reservas no está configurado correctamente."
    );
  }

  const url = new URL(GOOGLE_API_URL, window.location.origin);
  url.searchParams.set("action", action);

  const body = auth
    ? { ...payload, token: getStoredToken() }
    : payload;

  let result;

  try {
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Error de conexión con el servidor.");
    }

    result = await response.json();
  } catch (error) {
    console.error("Error en acción admin:", action, error);

    throw new Error(
      "No se pudo conectar con el servidor. Intentá nuevamente."
    );
  }

  if (!result.success) {
    if (result.code === "UNAUTHORIZED") {
      clearToken();
      window.dispatchEvent(new Event(ADMIN_LOGOUT_EVENT));
    }

    // Caso especial: el servidor pide confirmar antes de crear.
    if (result.needsConfirmation) {
      return result;
    }

    throw new Error(
      result.message || "No se pudo completar la acción."
    );
  }

  return result;
}

export async function adminLogin(password) {
  const result = await adminRequest(
    "adminLogin",
    { password },
    { auth: false }
  );

  storeToken(result.token);
}

export function adminLogout() {
  clearToken();
}

export function getStats({ from, to }) {
  return adminRequest("adminStats", { from, to });
}

export function getAgenda({ from, to }) {
  return adminRequest("adminAgenda", { from, to });
}

export function cancelAppointment(id) {
  return adminRequest("adminCancelAppointment", { id });
}

export function listAbsences({ from }) {
  return adminRequest("adminListAbsences", { from });
}

export function createAbsence(absence) {
  return adminRequest("adminCreateAbsence", absence);
}

export function deleteAbsence(id) {
  return adminRequest("adminDeleteAbsence", { id });
}
