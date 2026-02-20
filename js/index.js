const calendar = document.getElementById("calendar");
const horariosContainer = document.getElementById("horarios");

const hoy = new Date();
let fechaSeleccionada = null;
function generarCalendario() {
  calendar.innerHTML = "";

  const year = hoy.getFullYear();
  const month = hoy.getMonth();

  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();

  // Ajustar para que la semana empiece en lunes
  let firstDay = firstDate.getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  // 🔹 Header de días
  const header = document.createElement("div");
  header.classList.add("calendar-header");

  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  diasSemana.forEach(dia => {
    const div = document.createElement("div");
    div.textContent = dia;
    header.appendChild(div);
  });

  calendar.appendChild(header);

  // 🔹 Grid de días
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

    const hoySinHora = new Date();
    hoySinHora.setHours(0,0,0,0);

    if (fecha < hoySinHora) {
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

// Generador de horarios 
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