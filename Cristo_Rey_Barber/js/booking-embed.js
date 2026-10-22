/**
 * FASE 2 | Integración visual con Apps Script.
 * El backend recibe reservas dentro de su propio iframe (google.script.run).
 * No hay claves privadas en Netlify ni peticiones CORS a Sheets.
 */
(() => {
  'use strict';
  const config = window.CRISTO_REY_BOOKING || {};
  const url = String(config.appsScriptUrl || '').trim();
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(url)) return;
  const booking = document.getElementById('crBookingFrame');
  const fallback = document.getElementById('crBookingSetup');
  if (booking && fallback) {
    booking.src = url;
    booking.hidden = false;
    fallback.hidden = true;
  }
  // El catálogo público es una segunda vista del mismo Apps Script.
  const live = document.getElementById('crCatalogLive');
  const cards = document.getElementById('crServicesGrid');
  if (live && cards) {
    const iframe = document.createElement('iframe');
    iframe.title = 'Servicios y precios actualizados';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    const target = new URL(url);
    target.searchParams.set('view', 'catalogo');
    iframe.src = target.toString();
    live.appendChild(iframe);
    live.hidden = false;
    cards.hidden = true;
  }
})();