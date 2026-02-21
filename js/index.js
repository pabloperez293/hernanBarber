document.addEventListener("DOMContentLoaded", function() {

// ELEMENTOS
const calendar = document.getElementById("calendar");
const monthLabel = document.getElementById("monthLabel");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");
const horariosContainer = document.getElementById("horarios");

const servicioSelect = document.getElementById("servicioSelect");

const resServicio = document.getElementById("resServicio");
const resFecha = document.getElementById("resFecha");
const resHora = document.getElementById("resHora");
const resPrecio = document.getElementById("resPrecio");
const btnConfirmar = document.getElementById("btnConfirmar");

// VARIABLES
let fechaActual = new Date();
let mesActual = fechaActual.getMonth();
let añoActual = fechaActual.getFullYear();

let servicioSeleccionado = null;
let fechaSeleccionada = null;
let horaSeleccionada = null;

const PRECIOS = {
  corte: 4000,
  barba: 3000,
  "corte-barba": 6000,
  claritos: 12000
};

const meses = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

// ================= SERVICIO =================

servicioSelect.addEventListener("change", () => {

  servicioSeleccionado = servicioSelect.value;

  if (servicioSeleccionado) {
    resServicio.textContent =
      servicioSelect.options[servicioSelect.selectedIndex].text;

    resPrecio.textContent = "$" + PRECIOS[servicioSeleccionado];
  } else {
    resServicio.textContent = "-";
    resPrecio.textContent = "$0";
  }

  validarConfirmacion();
});

// ================= CALENDARIO =================

function generarCalendario() {

  calendar.innerHTML = "";

  monthLabel.textContent = `${meses[mesActual]} ${añoActual}`;

  const firstDate = new Date(añoActual, mesActual, 1);
  const lastDate = new Date(añoActual, mesActual + 1, 0).getDate();

  let firstDay = firstDate.getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const header = document.createElement("div");
  header.classList.add("calendar-header");

  ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].forEach(d => {
    const div = document.createElement("div");
    div.textContent = d;
    header.appendChild(div);
  });

  calendar.appendChild(header);

  const grid = document.createElement("div");
  grid.classList.add("calendar-grid");

  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= lastDate; day++) {

    const fecha = new Date(añoActual, mesActual, day);
    const dayDiv = document.createElement("div");
    dayDiv.textContent = day;
    dayDiv.classList.add("day");

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    if (fecha < hoy) {
      dayDiv.classList.add("disabled");
    }

    dayDiv.addEventListener("click", () => {

      if (dayDiv.classList.contains("disabled")) return;

      document.querySelectorAll(".day")
        .forEach(d => d.classList.remove("selected"));

      dayDiv.classList.add("selected");

      fechaSeleccionada = fecha;
      resFecha.textContent = fecha.toLocaleDateString("es-AR");

      generarHorarios(fecha);
      validarConfirmacion();
    });

    grid.appendChild(dayDiv);
  }

  calendar.appendChild(grid);
}

// ================= HORARIOS =================

function generarHorarios(fecha) {

  horariosContainer.innerHTML = "";

  let inicioMin = 9 * 60;
  const cierreMin = 20 * 60;

  for (let min = inicioMin; min < cierreMin; min += 30) {

    const h = Math.floor(min / 60);
    const m = min % 60;

    const horaTexto =
      String(h).padStart(2, "0") +
      ":" +
      String(m).padStart(2, "0");

    const btn = document.createElement("button");
    btn.classList.add("hora-btn");
    btn.textContent = horaTexto;

    btn.addEventListener("click", () => {

      document.querySelectorAll(".hora-btn")
        .forEach(b => b.classList.remove("selected"));

      btn.classList.add("selected");

      horaSeleccionada = horaTexto;
      resHora.textContent = horaTexto;

      validarConfirmacion();
    });

    horariosContainer.appendChild(btn);
  }
}

// ================= VALIDACIÓN =================

function validarConfirmacion() {
  btnConfirmar.disabled = !(servicioSeleccionado && fechaSeleccionada && horaSeleccionada);
}

// ================= CAMBIO MES =================

prevBtn.addEventListener("click", () => {
  const hoy = new Date();

  // Si estamos en el mes actual , no permitir retroceder a meses anteriores

  if( mesActual === hoy.getMonth() && 
      añoActual === hoy.getFullYear() ) {
    return;
  } 

  mesActual--;
  if (mesActual < 0) {
    mesActual = 11;
    añoActual--;
  }
  generarCalendario();
});

nextBtn.addEventListener("click", () => {
  mesActual++;
  if (mesActual > 11) {
    mesActual = 0;
    añoActual++;
  }
  generarCalendario();

  const hoyReal = new Date();

  if ( mesActual === hoyReal.getMonth() &&
        añoActual === hoyReal.getFullYear() 
      ) {
        prevBtn.disabled = true;
        prevBtn.style.opacity = "0.5";
      } else {
        prevBtn.disabled = false;
        prevBtn.style.opacity = "1";
      }
});

// INICIO
generarCalendario();

});
// ================= SCROLL ANIMATION =================

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
});

document.querySelectorAll(".fade-in").forEach(el => {
  observer.observe(el);
});