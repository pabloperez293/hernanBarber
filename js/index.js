const calendar = document.getElementById("calendar");
const horariosContainer = document.getElementById("horarios");

const hoy = new Date();
let fechaSeleccionada = null;

function generarCalendario() {
  calendar.innerHTML = "";

  const year = hoy.getFullYear();
  const month = hoy.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const grid = document.createElement("div");
  grid.classList.add("calendar-grid");

  // Espacios vacíos antes del primer día
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    grid.appendChild(empty);
  }

  for (let day = 1; day <= lastDate; day++) {
    const fecha = new Date(year, month, day);
    const dayDiv = document.createElement("div");
    dayDiv.textContent = day;
    dayDiv.classList.add("day");

    if (fecha < new Date().setHours(0,0,0,0)) {
      dayDiv.classList.add("disabled");
    }

    if (day === hoy.getDate()) {
      dayDiv.classList.add("today");
    }

    dayDiv.addEventListener("click", () => {
      document.querySelectorAll(".day").forEach(d => d.classList.remove("selected"));
      dayDiv.classList.add("selected");
      fechaSeleccionada = fecha;
      generarHorarios(fechaSeleccionada);
    });

    grid.appendChild(dayDiv);
  }

  calendar.appendChild(grid);
}

function generarHorarios(fecha) {
  horariosContainer.innerHTML = "";

  const ahora = new Date();
  const horaActual = ahora.getHours() * 60 + ahora.getMinutes();

  for (let h = 9; h < 20; h++) {
    for (let m = 0; m < 60; m += 30) {

      const totalMin = h * 60 + m;

      if (
        fecha.toDateString() === ahora.toDateString() &&
        totalMin <= horaActual
      ) continue;

      const horaTexto =
        String(h).padStart(2, "0") +
        ":" +
        String(m).padStart(2, "0");

      const btn = document.createElement("button");
      btn.classList.add("hora-btn");
      btn.textContent = horaTexto;

      btn.addEventListener("click", () => {
        document.querySelectorAll(".hora-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      });

      horariosContainer.appendChild(btn);
    }
  }
}

generarCalendario();


// Scroll 
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