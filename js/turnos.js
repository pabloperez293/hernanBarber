const servicioSelect = document.getElementById("servicio");
const horaInicioSelect = document.getElementById("horaInicio");
const horaFinSpan = document.getElementById("horaFin");
const fechaInput = document.getElementById("fecha");

// Duraciones de servicios en minutos
const DURACIONES = {
  "corte": 30,
  "barba": 30,
  "corte-barba": 30,
  "claritos": 60
};

// Horario laboral
const HORA_APERTURA = 9;   // 09:00
const HORA_CIERRE = 20;    // 20:00

// 🔹 Setear fecha mínima = hoy y máxima = último día del mes
const hoy = new Date();
const yyyy = hoy.getFullYear();
const mm = String(hoy.getMonth() + 1).padStart(2, "0");
const dd = String(hoy.getDate()).padStart(2, "0");
const fechaHoyISO = `${yyyy}-${mm}-${dd}`;

// Calcular el último día del mes actual
const ultimoDiaDelMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
const fechaMaxISO = ultimoDiaDelMes.toISOString().split("T")[0];

fechaInput.min = fechaHoyISO;
fechaInput.max = fechaMaxISO; // Solo permite fechas del mes actual

// Forzar que el campo fecha no permita seleccionar pasado o fuera del mes (doble validación)
fechaInput.addEventListener("input", () => {
  if (!fechaInput.value) return;
  
  if (fechaInput.value < fechaInput.min) {
    alert("No se permiten fechas pasadas. Se seleccionará la fecha mínima disponible.");
    fechaInput.value = fechaInput.min;
  } else if (fechaInput.value > fechaInput.max) {
    alert("Solo se permiten fechas del mes actual.");
    fechaInput.value = fechaInput.max;
  }
});

// Forzar que los inputs type=tel acepten solo números
const telInputs = document.querySelectorAll('input[type="tel"]');
telInputs.forEach(input => {
  input.setAttribute('inputmode', 'numeric');
  input.setAttribute('pattern', '[0-9]*');
  input.addEventListener('input', () => {
    const cleaned = input.value.replace(/\D+/g, '');
    if (input.value !== cleaned) input.value = cleaned;
  });
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D+/g, '');
    document.execCommand('insertText', false, text);
  });
});

function generarHorarios() {
  horaInicioSelect.innerHTML = "";
  horaInicioSelect.disabled = false;
  horaInicioSelect.innerHTML = `<option value="">Seleccionar</option>`;

  let fechaSeleccionada = new Date(fechaInput.value);
  if (isNaN(fechaSeleccionada)) return;

  // Si la fecha seleccionada está en el pasado -> forzar a la fecha mínima
  if (fechaInput.value < fechaInput.min) {
    alert("No se permiten fechas pasadas. Se seleccionará la fecha mínima disponible.");
    fechaInput.value = fechaInput.min;
    fechaSeleccionada = new Date(fechaInput.value);
  }

  const ahora = new Date();
  let horaInicio = HORA_APERTURA * 60;
  const horaCierre = HORA_CIERRE * 60;

  let sinHorarios = false;

  // Si la fecha es hoy → arrancar desde la hora actual
const fechaSeleccionadaISO = fechaInput.value;

if (fechaSeleccionadaISO === fechaHoyISO) {
    horaInicio = ahora.getHours() * 60 + ahora.getMinutes();

    // Redondear al próximo bloque de 30 minutos
    horaInicio = Math.ceil(horaInicio / 30) * 30;

    // Si ya pasó el horario de cierre
    if (horaInicio >= horaCierre) {
      sinHorarios = true;
    }
  }

  // Generar bloques cada 30 min (si hay horarios)
  if (!sinHorarios) {
    for (let min = horaInicio; min < horaCierre; min += 30) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      const horaTexto =
        String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");

      const option = document.createElement("option");
      option.value = horaTexto;
      option.textContent = horaTexto;
      horaInicioSelect.appendChild(option);
    }
  }

  // Si no se agregaron opciones (salvo la default) -> no hay horarios disponibles
  if (sinHorarios || horaInicioSelect.options.length <= 1) {
    horaInicioSelect.innerHTML = "";
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No hay horarios disponibles";
    option.disabled = true;
    horaInicioSelect.appendChild(option);
    horaInicioSelect.disabled = true;
    horaFinSpan.textContent = "--:--";
  }
}


// 🔹 Calcular hora fin según servicio
function calcularHoraFin() {
  const servicio = servicioSelect.value;
  const horaInicio = horaInicioSelect.value;

  if (!servicio || !horaInicio) {
    horaFinSpan.textContent = "--:--";
    return;
  }

  const duracion = DURACIONES[servicio];
  if (typeof duracion !== 'number') {
    horaFinSpan.textContent = "--:--";
    return;
  }

  const [h, m] = horaInicio.split(":").map(Number);
  const totalMin = h * 60 + m + duracion;

  const horaFin =
    String(Math.floor(totalMin / 60)).padStart(2, "0") +
    ":" +
    String(totalMin % 60).padStart(2, "0");

  horaFinSpan.textContent = horaFin;
}

// 🔹 Eventos
fechaInput.addEventListener("change", generarHorarios);
servicioSelect.addEventListener("change", calcularHoraFin);
horaInicioSelect.addEventListener("change", calcularHoraFin);


// Trabajos por MP
const form = document.getElementById("formTurno");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  // Validar que todo esté completo
  const nombre = form.querySelector('input[type="text"]').value.trim();
  const telefono = form.querySelector('input[type="tel"]').value.trim();
  const servicio = servicioSelect.value;
  const barbero = form.querySelector('select:not(#servicio):not(#horaInicio)').value;
  const fecha = fechaInput.value;
  const horaInicio = horaInicioSelect.value;
  const horaFin = horaFinSpan.textContent;

  if (!nombre || !telefono || !servicio || !barbero || !fecha || !horaInicio) {
    alert("Por favor completá todos los campos");
    return;
  }

  // 👉 (Opcional) Guardar resumen del turno en localStorage
  const resumen = {
    nombre,
    telefono,
    servicio,
    barbero,
    fecha,
    horaInicio,
    horaFin
  };
  localStorage.setItem("turnoPendiente", JSON.stringify(resumen));

  // 👉 Link de pago Mercado Pago
  const LINK_MP = "https://mpago.la/2tFBbWH";

  // Redirigir a Mercado Pago
  window.location.href = LINK_MP;
});
