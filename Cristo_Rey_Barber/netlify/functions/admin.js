/* CRISTO REY | Administración segura por Netlify */
const crypto = require("node:crypto");
const URL_GAS = process.env.GOOGLE_APPS_SCRIPT_URL;
const API_SECRET = process.env.BOOKING_API_SECRET;
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;
const COOKIE = "cr_admin_session";
const TTL = 6 * 60 * 60 * 1000;
const ACTIONS = new Set([
  "getPanel",
  "guardarServicio",
  "guardarBarbero",
  "asignarServicio",
  "guardarHorario",
  "guardarAusencia",
  "borrarAusencia",
  "cambiarEstadoReserva",
]);
const ARG_COUNT = {
  getPanel: 0,
  guardarServicio: 1,
  guardarBarbero: 1,
  asignarServicio: 3,
  guardarHorario: 1,
  guardarAusencia: 1,
  borrarAusencia: 1,
  cambiarEstadoReserva: 2,
};
function reply(code, obj, cookie) {
  return {
    statusCode: code,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...(cookie ? { "Set-Cookie": cookie } : {}),
    },
    body: JSON.stringify(obj),
  };
}
function cookieHeader(value, maxAge) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
function key() {
  return crypto.createHash("sha256").update(SESSION_SECRET).digest();
}
function encrypt(token) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.from(JSON.stringify({ token, exp: Date.now() + TTL }));
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString(
    "base64url",
  );
}
function decrypt(raw) {
  if (!raw) return null;
  try {
    const buf = Buffer.from(raw, "base64url");
    if (buf.length < 30) return null;
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      key(),
      buf.subarray(0, 12),
    );
    decipher.setAuthTag(buf.subarray(12, 28));
    const obj = JSON.parse(
      Buffer.concat([
        decipher.update(buf.subarray(28)),
        decipher.final(),
      ]).toString(),
    );
    return obj.exp > Date.now() && typeof obj.token === "string"
      ? obj.token
      : null;
  } catch {
    return null;
  }
}
function readCookie(headers) {
  const value = (headers.cookie || headers.Cookie || "")
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(COOKIE + "="));
  return value ? value.slice(COOKIE.length + 1) : "";
}
async function gas(action, props) {
  const res = await fetch(URL_GAS, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, secret: API_SECRET, ...props }),
    redirect: "follow",
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw Error("El servidor de reservas no respondió.");
  const body = await res.json();
  if (!body || typeof body.ok !== "boolean")
    throw Error("Respuesta inválida de Apps Script.");
  return body;
}
exports.handler = async (event) => {
  if (event.httpMethod !== "POST")
    return reply(405, { ok: false, error: "Método no permitido." });
  if (!URL_GAS || !API_SECRET || !SESSION_SECRET || SESSION_SECRET.length < 32)
    return reply(503, {
      ok: false,
      error: "Falta configurar la administración en Netlify.",
    });
  // Prevención de CSRF: rechazar solicitudes desde otro origen.
  const origin = event.headers.origin || event.headers.Origin;
  const host = event.headers.host || event.headers.Host;
  if (!origin || !host) {
    return reply(403, { ok: false, error: "Origen no autorizado." });
  }
  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    return reply(403, { ok: false, error: "Origen inválido." });
  }
  if (originHost !== host)
    return reply(403, { ok: false, error: "Origen no autorizado." });
  let req;
  try {
    req = JSON.parse(event.body || "{}");
  } catch {
    return reply(400, { ok: false, error: "Solicitud inválida." });
  }
  const action = req.action;
  if (action === "loginAdmin") {
    if (typeof req.password !== "string" || req.password.length > 256)
      return reply(400, { ok: false, error: "Contraseña inválida." });
    try {
      const result = await gas(action, { password: req.password });
      if (!result.ok)
        return reply(401, {
          ok: false,
          error: result.error || "Acceso denegado.",
        });
      return reply(
        200,
        { ok: true, data: "sesion" },
        cookieHeader(encrypt(result.data), 21600),
      );
    } catch (e) {
      console.error("admin login", e.message);
      return reply(502, {
        ok: false,
        error: "No se pudo conectar con el servidor.",
      });
    }
  }
  const token = decrypt(readCookie(event.headers));
  if (!token)
    return reply(
      401,
      { ok: false, error: "Sesión vencida. Volvé a ingresar." },
      cookieHeader("", 0),
    );
  if (action === "logoutAdmin") {
    try {
      await gas(action, { token });
    } catch (e) {
      console.warn("admin logout", e.message);
    }
    return reply(200, { ok: true, data: true }, cookieHeader("", 0));
  }
  if (!ACTIONS.has(action))
    return reply(400, { ok: false, error: "Acción no permitida." });
  const args = Array.isArray(req.args) ? req.args : [];
  if (args.length !== ARG_COUNT[action] || JSON.stringify(args).length > 10000)
    return reply(400, { ok: false, error: "Datos inválidos." });
  try {
    const result = await gas(action, { token, args });
    return reply(result.ok ? 200 : 400, result);
  } catch (e) {
    console.error("admin action", e.message);
    return reply(502, {
      ok: false,
      error: "No se pudo conectar con el servidor.",
    });
  }
};
