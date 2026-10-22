
/* ==========================================================
   CRISTO REY BARBER SHOP
   01 | FUNCIÓN SEGURA DE NETLIFY

   Esta función:
   - Recibe solicitudes desde nuestra página.
   - Agrega la clave privada en el servidor.
   - Consulta Google Apps Script.
   - Devuelve el resultado al navegador.

   IMPORTANTE:
   La clave privada nunca se envía al cliente.
   ========================================================== */

const SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
const API_SECRET = process.env.BOOKING_API_SECRET;

const ACCIONES_PERMITIDAS = new Set([
  "catalogo",
  "disponibilidad",
  "reservar"
]);

// 02 | Construir una respuesta JSON uniforme.
function responder(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(data)
  };
}

// 03 | Recibir solicitudes del formulario.
exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return responder(405, {
      ok: false,
      error: "Método no permitido."
    });
  }

  if (!SCRIPT_URL || !API_SECRET) {
    return responder(500, {
      ok: false,
      error: "El servidor no está configurado."
    });
  }

  let solicitud;

  try {
    solicitud = JSON.parse(event.body || "{}");
  } catch {
    return responder(400, {
      ok: false,
      error: "Los datos enviados no son válidos."
    });
  }

  if (!ACCIONES_PERMITIDAS.has(solicitud.action)) {
    return responder(400, {
      ok: false,
      error: "Operación no permitida."
    });
  }

  // 04 | Enviar únicamente los campos necesarios.
  const payload = {
    action: solicitud.action,
    secret: API_SECRET
  };

  if (solicitud.action === "disponibilidad") {
    payload.fecha = solicitud.fecha;
    payload.barberoId = solicitud.barberoId;
    payload.servicioId = solicitud.servicioId;
  }

  if (solicitud.action === "reservar") {
    payload.reserva = solicitud.reserva;
  }

  try {
    // 05 | Consultar el backend de Google.
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      throw new Error("Google Apps Script no respondió correctamente.");
    }

    const data = await response.json();

    if (!data || typeof data.ok !== "boolean") {
      throw new Error("Respuesta inesperada del servidor.");
    }

    return responder(data.ok ? 200 : 400, data);

  } catch (error) {
    console.error("Error en reservas:", error.message);

    return responder(502, {
      ok: false,
      error: "No pudimos conectar con las reservas. Intentá nuevamente."
    });
  }
};
