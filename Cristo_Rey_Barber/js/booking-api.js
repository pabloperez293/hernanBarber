/* 01 | API pública: la clave privada permanece en Netlify Functions. */
window.CristoReyAPI = Object.freeze({
  async solicitar(action, datos = {}) {
    const response = await fetch('/.netlify/functions/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...datos })
    });
    const json = await response.json().catch(() => null);
    if (!json || !json.ok) throw new Error(json?.error || 'No pudimos consultar la agenda.');
    return json.data;
  },
  catalogo() { return this.solicitar('catalogo'); },
  disponibilidad(fecha, barberoId, servicioId) {
    return this.solicitar('disponibilidad', { fecha, barberoId, servicioId });
  },
  reservar(reserva) { return this.solicitar('reservar', { reserva }); }
});
