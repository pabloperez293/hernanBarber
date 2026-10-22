/**
 * CRISTO REY BARBER SHOP
 * FASE 2 | Reservas con transición de marca
 *
 * 01. Mantiene visibles las tarjetas originales.
 * 02. Evita los iframes de Google Apps Script.
 * 03. Muestra el logo durante la navegación.
 * 04. Abre las reservas en la misma pestaña.
 */

(() => {
  "use strict";

  // 01 | CONFIGURACIÓN
  const config = window.CRISTO_REY_BOOKING || {};
  const bookingUrl = String(config.appsScriptUrl || "").trim();

  if (
    !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(
      bookingUrl,
    )
  ) {
    console.error("Cristo Rey: URL de reservas inválida.");
    return;
  }

  // 02 | INICIALIZACIÓN
  function iniciarReservas() {
    const iframe = document.getElementById("crBookingFrame");
    const fallback = document.getElementById("crBookingSetup");
    const catalogoIframe = document.getElementById("crCatalogLive");
    const tarjetas = document.getElementById("crServicesGrid");

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

    // 03 | PANTALLA DE TRANSICIÓN
    const overlay = document.createElement("div");
    overlay.id = "crBookingTransition";
    overlay.setAttribute("role", "status");
    overlay.setAttribute("aria-label", "Abriendo calendario de reservas");

    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "99999",
      background: "#042C2E",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
      opacity: "0",
      visibility: "hidden",
      transition: "opacity .35s ease, visibility .35s ease",
    });

    const logo = document.createElement("img");
    logo.src = "assets/images/LogoCristoreybarber.jpg";
    logo.alt = "Cristo Rey Barber Shop";

    Object.assign(logo.style, {
      width: "130px",
      height: "130px",
      objectFit: "contain",
      borderRadius: "50%",
      animation: "crLogoPulse 1.1s ease-in-out infinite alternate",
    });

    const texto = document.createElement("p");
    texto.textContent = "PREPARANDO TU RESERVA...";
    Object.assign(texto.style, {
      color: "#D3AF5B",
      fontFamily: "Arial, sans-serif",
      fontSize: "13px",
      fontWeight: "700",
      letterSpacing: "3px",
      textAlign: "center",
    });

    const style = document.createElement("style");
    style.textContent = `
      @keyframes crLogoPulse {
        from { transform: scale(.94); opacity: .7; }
        to { transform: scale(1.04); opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        #crBookingTransition img { animation: none !important; }
      }
    `;

    overlay.append(logo, texto);
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // 04 | ABRIR RESERVAS EN LA MISMA PESTAÑA
    let navegando = false;

   
function abrirReservas(evento) {
  if (
    evento &&
    (evento.button !== 0 ||
      evento.ctrlKey ||
      evento.metaKey ||
      evento.shiftKey ||
      evento.altKey)
  ) {
    return;
  }

  if (evento) evento.preventDefault();
  if (navegando) return;

  navegando = true;

  overlay.style.visibility = "visible";
  overlay.style.opacity = "1";

  const destino = new URL(bookingUrl);
  destino.searchParams.set("view", "booking");

  setTimeout(() => {
    window.location.assign(destino.toString());
  }, 850);
}


    // 05 | BOTÓN PRINCIPAL
    if (fallback) {
      fallback.hidden = false;

      let boton = document.getElementById("crAbrirReservas");

      if (!boton) {
        boton = document.createElement("a");
        boton.id = "crAbrirReservas";
        boton.className = "btn btn-gold";
        boton.textContent = "ELEGIR FECHA Y RESERVAR ↗";
        fallback.appendChild(boton);
      }

      boton.href = bookingUrl;
      boton.removeAttribute("target");
    }

    // 06 | ENLACES DE RESERVA
    const enlaces = document.querySelectorAll(
      'a[href="#turnos"], a[href="' + bookingUrl + '"], #crAbrirReservas',
    );

    enlaces.forEach((enlace) => {
      enlace.href = bookingUrl;
      enlace.removeAttribute("target");
      enlace.addEventListener("click", abrirReservas);
    });

    // 07 | RESTABLECER SI EL CLIENTE REGRESA
    window.addEventListener("pageshow", () => {
      navegando = false;
      overlay.style.visibility = "hidden";
      overlay.style.opacity = "0";
    });

    console.info("Cristo Rey: reservas con transición activadas.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarReservas);
  } else {
    iniciarReservas();
  }
})();
