
/**
 * CRISTO REY BARBER SHOP
 * FASE 2 | Acceso al sistema de reservas
 *
 * Abre Google Apps Script directamente para evitar
 * problemas con iframes y redirecciones de Google.
 */

(() => {
  "use strict";

  // 01 | CONFIGURACIÓN
  const config = window.CRISTO_REY_BOOKING || {};
  const bookingUrl = String(config.appsScriptUrl || "").trim();

  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(bookingUrl)) {
    console.error("Cristo Rey: URL de Apps Script inválida o faltante.");
    return;
  }

  // 02 | ESPERAR A QUE CARGUE LA PÁGINA
  function iniciarReservas() {
    const iframe = document.getElementById("crBookingFrame");
    const fallback = document.getElementById("crBookingSetup");
    const catalogoIframe = document.getElementById("crCatalogLive");
    const tarjetas = document.getElementById("crServicesGrid");

    // 03 | OCULTAR LOS IFRAMES DE GOOGLE
    if (iframe) {
      iframe.removeAttribute("src");
      iframe.hidden = true;
    }

    if (catalogoIframe) {
      catalogoIframe.hidden = true;
    }

    if (tarjetas) {
      tarjetas.hidden = false;
    }

    // 04 | CREAR ACCESO AL CALENDARIO
    if (fallback) {
      fallback.hidden = false;

      let boton = document.getElementById("crAbrirReservas");

      if (!boton) {
        boton = document.createElement("a");
        boton.id = "crAbrirReservas";
        boton.textContent = "ELEGIR FECHA Y RESERVAR ↗";
        boton.className = "btn btn-gold";
        fallback.appendChild(boton);
      }

      boton.href = bookingUrl;
      boton.target = "_blank";
      boton.rel = "noopener noreferrer";
    }

    // 05 | CONECTAR BOTONES DE LOS SERVICIOS
    document.querySelectorAll('a[href="#turnos"]').forEach(enlace => {
      if (enlace.closest("#crServicesGrid")) {
        enlace.href = bookingUrl;
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
      }
    });

    // 06 | INFORMACIÓN DE DEPURACIÓN
    console.info("Cristo Rey: sistema de reservas conectado.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarReservas);
  } else {
    iniciarReservas();
  }
})();
