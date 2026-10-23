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
