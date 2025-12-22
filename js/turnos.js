const servicioSelect = document.getElementById('servicio');
const horaInicioInput = document.getElementById('horaInicio');
const horaFinSpan = document.getElementById('horaFin');

function calcularHoraFin() {
  const servicioSeleccionado = servicioSelect.selectedOptions[0];
  const duracion = servicioSeleccionado?.dataset.duration;
  const horaInicio = horaInicioInput.value;

  if (!duracion || !horaInicio) {
    horaFinSpan.textContent = '--:--';
    return;
  }

  const [horas, minutos] = horaInicio.split(':').map(Number);
  const fecha = new Date();
  fecha.setHours(horas);
  fecha.setMinutes(minutos + Number(duracion));

  const horaFin = fecha.toTimeString().slice(0,5);
  horaFinSpan.textContent = horaFin;
}

servicioSelect.addEventListener('change', calcularHoraFin);
horaInicioInput.addEventListener('change', calcularHoraFin);
