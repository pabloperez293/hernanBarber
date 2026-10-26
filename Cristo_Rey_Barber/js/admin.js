// 09 | ESTADO, API Y FUNCIONES AUXILIARES
const $ = (id) => document.getElementById(id);
let token = "",
  data = null;
function aviso(msg, isError = false) {
  const el = $("estado");
  el.textContent = msg;
  el.className = "status" + (isError ? " error" : "");
}
async function api(name, ...args) {
  const payload = { action: name };
  if (name === "loginAdmin") payload.password = args[0];
  else if (name !== "getPanel" && name !== "logoutAdmin")
    payload.args = args.slice(1);
  const response = await fetch("/.netlify/functions/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(payload),
  });
  const result = await response
    .json()
    .catch(() => ({ ok: false, error: "Respuesta inválida del servidor." }));
  if (!response.ok || !result.ok)
    throw new Error(result.error || "No se pudo completar la operación.");
  return result.data;
}
function safe(text) {
  return String(text ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
async function ejecutar(fn) {
  try {
    aviso("Guardando cambios...");
    await fn();
    await cargar();
    aviso("Cambios guardados correctamente.");
  } catch (e) {
    aviso(e.message || "Error al guardar.", true);
  }
}
async function cargar() {
  data = await api("getPanel", token);
  dibujar();
  try {
    await cargarCRM();
  } catch (e) {
    console.warn("CRM no disponible:", e.message);
    $("listaRecordatorios").textContent =
      "No se pudo cargar CRM. Verificá la instalación en Apps Script.";
    aviso("Panel cargado, pero CRM no disponible: " + e.message, true);
  }
}
function opciones(id, items) {
  const el = $(id),
    old = el.value;
  el.replaceChildren();
  items.forEach((x) => el.add(new Option(x.nombre, x.id)));
  if (items.some((x) => x.id === old)) el.value = old;
}
function nombreDe(items, id) {
  return items.find((x) => x.id === id)?.nombre || "Desconocido";
}

// 10 | INICIAR / CERRAR SESIÓN
// Mostrar u ocultar la contraseña sin modificar su valor.
$("togglePassword").addEventListener("click", () => {
  const input = $("password");
  const visible = input.type === "password";
  input.type = visible ? "text" : "password";
  $("togglePassword").textContent = visible ? "Ocultar" : "Mostrar";
  $("togglePassword").setAttribute("aria-pressed", String(visible));
  $("togglePassword").setAttribute(
    "aria-label",
    visible ? "Ocultar contraseña" : "Mostrar contraseña",
  );
});
function loginCargando(loading, message = "Conectando con la administración…") {
  $("loginSubmit").disabled = loading;
  $("password").disabled = loading;
  $("loginButtonText").textContent = loading ? "CONECTANDO…" : "INGRESAR";
  $("loginSpinner").classList.toggle("hidden", !loading);
  $("loginProgress").classList.toggle("hidden", !loading);
  $("loginProgress").textContent = message;
  $("loginForm").setAttribute("aria-busy", String(loading));
}
$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if ($("loginSubmit").disabled) return;
  loginCargando(true);
  aviso("Conectando de forma segura…");
  let progressTimer;
  try {
    progressTimer = setTimeout(
      () => loginCargando(true, "Verificando acceso y cargando los datos…"),
      1800,
    );
    token = await api("loginAdmin", $("password").value);
    $("password").value = "";
    $("password").type = "password";
    $("togglePassword").textContent = "Mostrar";
    $("togglePassword").setAttribute("aria-pressed", "false");
    $("togglePassword").setAttribute("aria-label", "Mostrar contraseña");
    await cargar();
    $("loginPanel").classList.add("hidden");
    $("dashboard").classList.remove("hidden");
    aviso("Sesión iniciada.");
  } catch (err) {
    token = "";
    aviso(err.message || "No fue posible conectar. Intentá nuevamente.", true);
  } finally {
    clearTimeout(progressTimer);
    loginCargando(false);
  }
});
$("salir").addEventListener("click", async () => {
  try {
    await api("logoutAdmin", token);
  } catch (e) {
    console.warn(e);
  }
  token = "";
  data = null;
  $("dashboard").classList.add("hidden");
  $("loginPanel").classList.remove("hidden");
  aviso("Sesión cerrada.");
});
document.querySelectorAll("[data-tab]").forEach((b) =>
  b.addEventListener("click", () => {
    document
      .querySelectorAll("[data-tab]")
      .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    document
      .querySelectorAll(".tab")
      .forEach((x) =>
        x.classList.toggle("hidden", x.id !== "tab-" + b.dataset.tab),
      );
  }),
);

// 11 | RENDERIZAR TABLAS Y FORMULARIOS
function dibujar() {
  $("listaServicios").innerHTML = data.servicios
    .map(
      (s) =>
        `<div class="item row"><span><b>${safe(s.nombre)}</b> · ${s.duracion} min · ${s.desdePrecio ? "Desde " : ""}$${Number(s.precio).toLocaleString("es-AR")} · ${s.activo ? "Activo" : "Inactivo"}</span><button class="secondary" data-service="${safe(s.id)}">Editar</button></div>`,
    )
    .join("");
  $("listaBarberos").innerHTML = data.barberos
    .map(
      (b) =>
        `<div class="item row"><span><b>${safe(b.nombre)}</b> · ${b.activo ? "Activo" : "Inactivo"}</span><button class="secondary" data-barber="${safe(b.id)}">Editar</button></div>`,
    )
    .join("");
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  $("listaHorarios").innerHTML = data.horarios
    .map(
      (h) =>
        `<div class="item">${safe(nombreDe(data.barberos, h.barberoId))} · ${days[h.dia]} · ${safe(h.desde)}–${safe(h.hasta)} · ${h.activo ? "Abierto" : "Cerrado"}</div>`,
    )
    .join("");
  $("listaAusencias").innerHTML = data.ausencias
    .map(
      (a) =>
        `<div class="item row"><span>${safe(nombreDe(data.barberos, a.barberoId))} · ${safe(a.fecha)} · ${safe(a.desde)}–${safe(a.hasta)} · ${safe(a.motivo)}</span><button class="secondary" data-absence="${safe(a.id)}">Quitar bloqueo</button></div>`,
    )
    .join("");
  $("listaReservas").innerHTML =
    data.reservas
      .map(
        (r) =>
          `<div class="item row"><span><b>${safe(r.fecha)} ${safe(r.hora)}</b> · ${safe(r.nombre)} · ${safe(r.telefono)} · ${safe(nombreDe(data.servicios, r.servicioId))} · ${safe(nombreDe(data.barberos, r.barberoId))} · ${safe(r.estado)}</span>${r.estado === "confirmada" ? `<button class="secondary" data-cancel="${safe(r.id)}">Cancelar</button>` : ""}</div>`,
      )
      .join("") || "<p>No hay reservas todavía.</p>";
  ["asBarbero", "hBarbero", "aBarbero"].forEach((id) =>
    opciones(id, data.barberos),
  );
  ["asServicio"].forEach((id) => opciones(id, data.servicios));
}
$("listaServicios").addEventListener("click", (e) => {
  const id = e.target.dataset.service;
  if (!id) return;
  const s = data.servicios.find((x) => x.id === id);
  $("sId").value = s.id;
  $("sNombre").value = s.nombre;
  $("sDuracion").value = s.duracion;
  $("sPrecio").value = s.precio;
  $("sActivo").value = String(s.activo);
  $("sDesdePrecio").value = String(s.desdePrecio);
  $("tituloServicio").textContent = "Editar servicio";
});
$("listaBarberos").addEventListener("click", (e) => {
  const id = e.target.dataset.barber;
  if (!id) return;
  const b = data.barberos.find((x) => x.id === id);
  $("bId").value = b.id;
  $("bNombre").value = b.nombre;
  $("bActivo").value = String(b.activo);
});
$("limpiarServicio").addEventListener("click", () => {
  $("formServicio").reset();
  $("sId").value = "";
  $("tituloServicio").textContent = "Nuevo servicio";
});
$("limpiarBarbero").addEventListener("click", () => {
  $("formBarbero").reset();
  $("bId").value = "";
});

// 12 | GUARDAR SERVICIOS, BARBEROS Y ASIGNACIONES
$("formServicio").addEventListener("submit", (e) => {
  e.preventDefault();
  ejecutar(() =>
    api("guardarServicio", token, {
      id: $("sId").value,
      nombre: $("sNombre").value,
      duracion: Number($("sDuracion").value),
      precio: Number($("sPrecio").value),
      activo: $("sActivo").value === "true",
      desdePrecio: $("sDesdePrecio").value === "true",
    }),
  );
});
$("formBarbero").addEventListener("submit", (e) => {
  e.preventDefault();
  ejecutar(() =>
    api("guardarBarbero", token, {
      id: $("bId").value,
      nombre: $("bNombre").value,
      activo: $("bActivo").value === "true",
    }),
  );
});
$("guardarAsignacion").addEventListener("click", () =>
  ejecutar(() =>
    api(
      "asignarServicio",
      token,
      $("asBarbero").value,
      $("asServicio").value,
      $("asEstado").value === "true",
    ),
  ),
);

// 13 | GUARDAR HORARIOS, AUSENCIAS Y CANCELACIONES
$("formHorario").addEventListener("submit", (e) => {
  e.preventDefault();
  ejecutar(() =>
    api("guardarHorario", token, {
      barberoId: $("hBarbero").value,
      dia: Number($("hDia").value),
      desde: $("hDesde").value,
      hasta: $("hHasta").value,
      activo: $("hActivo").value === "true",
    }),
  );
});
$("formAusencia").addEventListener("submit", (e) => {
  e.preventDefault();
  ejecutar(() =>
    api("guardarAusencia", token, {
      barberoId: $("aBarbero").value,
      fecha: $("aFecha").value,
      desde: $("aDesde").value,
      hasta: $("aHasta").value,
      motivo: $("aMotivo").value,
    }),
  );
});
$("listaAusencias").addEventListener("click", (e) => {
  const id = e.target.dataset.absence;
  if (id && confirm("¿Quitar este bloqueo?"))
    ejecutar(() => api("borrarAusencia", token, id));
});
$("listaReservas").addEventListener("click", (e) => {
  const id = e.target.dataset.cancel;
  if (id && confirm("¿Cancelar esta reserva?"))
    ejecutar(() => api("cambiarEstadoReserva", token, id, "cancelada"));
});
$("recargarReservas").addEventListener("click", async () => {
  try {
    aviso("Actualizando reservas...");
    await cargar();
    aviso("Reservas actualizadas.");
  } catch (e) {
    aviso(e.message, true);
  }
});

// Recuperar sesión sin guardar contraseñas ni tokens en el navegador.
(async () => {
  try {
    await cargar();
    token = "sesion";
    $("loginPanel").classList.add("hidden");
    $("dashboard").classList.remove("hidden");
    aviso("Sesión restaurada.");
  } catch (e) {
    /* sin sesión: mostrar acceso */
  }
})();

// 14 | CRM: recordatorios manuales, clientes frecuentes y reportes.
let crm = null;
async function cargarCRM() {
  crm = await api("getCRM", token);
  dibujarCRM();
}
function waLink(phone, message) {
  const digits = String(phone || "").replace(/\D/g, "");
  return /^\d{10,15}$/.test(digits)
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : "";
}
function dibujarCRM() {
  if (!crm) return;
  const estado = crm.estados || {};
  $("listaRecordatorios").innerHTML =
    crm.recordatorios
      .map((r) => {
        const barber = nombreDe(data.barberos, r.barberoId);
        const servicio = nombreDe(data.servicios, r.servicioId);
        const textoCliente = `Hola ${r.nombre}, te recordamos tu turno en Cristo Rey Barber el ${r.fecha} a las ${r.hora} con ${barber} para ${servicio}. ¡Te esperamos!`;
        const textoBarbero = `Hola ${barber}, recordatorio de turno: ${r.fecha} ${r.hora}, cliente ${r.nombre}, servicio ${servicio}.`;
        const clienteUrl = waLink(r.telefono, textoCliente);
        const barberoUrl = waLink(
          (crm.telefonosBarberos || {})[r.barberoId],
          textoBarbero,
        );
        const clienteOK = estado[r.id + "|cliente"];
        const barberoOK = estado[r.id + "|barbero"];
        return `<div class="item crm-recordatorio"><strong>${safe(r.fecha)} · ${safe(r.hora)} · ${safe(r.nombre)}</strong><p class="small">${safe(servicio)} · ${safe(barber)}</p><div class="crm-actions">${clienteUrl ? `<a class="crm-link" href="${clienteUrl}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp cliente</a>` : '<span class="small">Teléfono del cliente inválido</span>'}<button type="button" class="secondary" data-reminder="${safe(r.id)}" data-recipient="cliente" ${clienteOK ? "disabled" : ""}>${clienteOK ? "Cliente: marcado enviado" : "Marcar cliente enviado"}</button>${barberoUrl ? `<a class="crm-link" href="${barberoUrl}" target="_blank" rel="noopener noreferrer">Abrir WhatsApp barbero</a>` : '<span class="small">Configurá WhatsApp del barbero</span>'}<button type="button" class="secondary" data-reminder="${safe(r.id)}" data-recipient="barbero" ${barberoOK || !barberoUrl ? "disabled" : ""}>${barberoOK ? "Barbero: marcado enviado" : "Marcar barbero enviado"}</button></div></div>`;
      })
      .join("") ||
    '<p class="small">No hay turnos confirmados para hoy o mañana.</p>';
  $("telefonosBarberos").innerHTML = data.barberos
    .map(
      (b) =>
        `<form class="crm-phone" data-barber-phone="${safe(b.id)}"><label>${safe(b.nombre)}<input name="telefono" type="tel" autocomplete="off" placeholder="54911XXXXXXXX" value="${safe((crm.telefonosBarberos || {})[b.id] || "")}" /></label><button type="submit">Guardar número</button></form>`,
    )
    .join("");
  $("resumenFrecuentes").textContent =
    `${crm.frecuentes.length} clientes frecuentes (3 o más reservas pasadas no canceladas).`;
  $("listaFrecuentes").innerHTML =
    crm.frecuentes
      .map(
        (c) =>
          `<div class="item"><strong>${safe(c.nombre)}</strong> · ${safe(c.telefono)} · ${c.visitas} reservas pasadas · Última: ${safe(c.ultima)}</div>`,
      )
      .join("") || '<p class="small">Todavía no hay clientes frecuentes.</p>';
  $("resumenReportes").textContent =
    `Clientes registrados: ${crm.totalClientes}. Se muestran las primeras reservas por mes.`;
  $("listaReportes").innerHTML =
    `<div class="crm-table-wrap"><table class="crm-table"><thead><tr><th>Mes</th><th>Clientes nuevos</th><th>Reservas registradas</th></tr></thead><tbody>${crm.reportes.map((x) => `<tr><td>${safe(x.mes)}</td><td>${x.nuevos}</td><td>${x.reservas}</td></tr>`).join("")}</tbody></table></div>`;
}
$("actualizarCRM").addEventListener("click", async () => {
  try {
    aviso("Actualizando reportes...");
    await cargarCRM();
    aviso("Datos actualizados.");
  } catch (e) {
    aviso(e.message, true);
  }
});
$("listaRecordatorios").addEventListener("click", async (e) => {
  const b = e.target.closest("button[data-reminder]");
  if (!b || !confirm("¿Confirmás que enviaste este mensaje por WhatsApp?"))
    return;
  await ejecutar(() =>
    api("marcarRecordatorio", token, b.dataset.reminder, b.dataset.recipient),
  );
});
$("telefonosBarberos").addEventListener("submit", async (e) => {
  const form = e.target.closest("form[data-barber-phone]");
  if (!form) return;
  e.preventDefault();
  await ejecutar(() =>
    api(
      "guardarTelefonoBarbero",
      token,
      form.dataset.barberPhone,
      form.elements.telefono.value,
    ),
  );
});
