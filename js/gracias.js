// Obtener turno guardado antes de ir a Mercado Pago
const datos = JSON.parse(localStorage.getItem("turnoPendiente"));

const resumenDiv = document.getElementById("resumenTurno");
const btnWhatsapp = document.getElementById("btnWhatsapp");

if (!datos) {
  resumenDiv.innerHTML = "<p>No se encontró información del turno.</p>";
} else {
  // Mostrar resumen
  resumenDiv.innerHTML = `
    <p><strong>Nombre:</strong> ${datos.nombre}</p>
    <p><strong>Teléfono:</strong> ${datos.telefono}</p>
    <p><strong>Servicio:</strong> ${datos.servicio}</p>
    <p><strong>Barbero:</strong> ${datos.barbero}</p>
    <p><strong>Fecha:</strong> ${datos.fecha}</p>
    <p><strong>Hora:</strong> ${datos.horaInicio} - ${datos.horaFin}</p>
  `;

  // Número del barbero (cambialo por el real)
  const numeroBarbero = "5491122334455"; // <-- tu número aquí

  // Mensaje WhatsApp
  const mensaje = `Hola! Quiero confirmar mi turno:
Nombre: ${datos.nombre}
Servicio: ${datos.servicio}
Barbero: ${datos.barbero}
Fecha: ${datos.fecha}
Horario: ${datos.horaInicio} a ${datos.horaFin}
Seña pagada por Mercado Pago ✔️`;

  // Link WhatsApp
  const linkWhatsapp = `https://wa.me/${numeroBarbero}?text=${encodeURIComponent(mensaje)}`;

  btnWhatsapp.href = linkWhatsapp;

  // Limpiar storage (opcional)
  localStorage.removeItem("turnoPendiente");
}
