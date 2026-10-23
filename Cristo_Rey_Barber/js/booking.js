/* CRISTO REY | Calendario responsive + reservas reales */
(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const api = window.CristoReyAPI;
  if (!el('crForm')) return;
  if (!api) { console.error('Cristo Rey: falta booking-api.js'); return; }
  let catalogo = null, hora = '', ocupada = false, secuencia = 0;
  const precio = n => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
  const formatter = new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' });
  function fechaLocal(d) {
    const parts = Object.fromEntries(formatter.formatToParts(d).filter(x => x.type !== 'literal').map(x => [x.type, x.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  }
  const hoy = fechaLocal(new Date());
  const max = new Date(hoy + 'T12:00:00Z');
  max.setUTCDate(max.getUTCDate() + 60);
  const ultimoDia = max.toISOString().slice(0, 10);
  let mes = new Date(Number(hoy.slice(0,4)), Number(hoy.slice(5,7)) - 1, 1);
  const iso = (y,m,d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  function aviso(msg, tipo = '') {
    const box = el('crMessage'); box.hidden = false; box.textContent = msg;
    box.className = 'cr-message ' + tipo;
  }
  function opciones(id, items, texto) {
    const select = el(id); select.replaceChildren(new Option(texto, ''));
    items.forEach(x => select.add(new Option(x.nombre, x.id)));
  }
  function pintarCalendario() {
    const y = mes.getFullYear(), m = mes.getMonth();
    el('crMonth').textContent = new Intl.DateTimeFormat('es-AR', { month:'long', year:'numeric' }).format(mes);
    const grid = el('crDays'); grid.replaceChildren();
    ['LU','MA','MI','JU','VI','SA','DO'].forEach(t => {
      const s = document.createElement('span'); s.className='cr-weekday'; s.textContent=t; grid.append(s);
    });
    const offset = (new Date(y,m,1).getDay()+6)%7;
    for (let i=0;i<offset;i++) grid.append(document.createElement('span'));
    const count = new Date(y,m+1,0).getDate();
    for (let d=1;d<=count;d++) {
      const date=iso(y,m,d), weekday=new Date(y,m,d).getDay();
      const btn=document.createElement('button'); btn.type='button'; btn.className='cr-day'; btn.textContent=d;
      btn.disabled=date<hoy || date>ultimoDia || weekday===0 || weekday===1;
      btn.setAttribute('aria-pressed', String(el('crFecha').value===date));
      btn.setAttribute('aria-label', new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(y,m,d)));
      if(date===hoy)btn.classList.add('today');
      btn.addEventListener('click',()=>{
        el('crFecha').value=date;
        el('crDateHint').textContent='Fecha seleccionada: '+btn.getAttribute('aria-label');
        pintarCalendario(); cargarHorarios();
      });
      grid.append(btn);
    }
    const visible=iso(y,m,1).slice(0,7);
    el('crPrev').disabled=visible<=hoy.slice(0,7);
    el('crNext').disabled=visible>=ultimoDia.slice(0,7);
  }
  el('crPrev').addEventListener('click',()=>{mes=new Date(mes.getFullYear(),mes.getMonth()-1,1);pintarCalendario();});
  el('crNext').addEventListener('click',()=>{mes=new Date(mes.getFullYear(),mes.getMonth()+1,1);pintarCalendario();});
  pintarCalendario();
  api.catalogo().then(data=>{
    catalogo=data; opciones('crServicio',data.servicios,'Elegí un servicio');
    if (!data.servicios.length) aviso('No hay servicios activos por el momento.','error');
  }).catch(err=>{opciones('crServicio',[],'No se pudieron cargar servicios');aviso(err.message,'error');});
  el('crServicio').addEventListener('change',()=>{
    const servicio=catalogo?.servicios.find(x=>x.id===el('crServicio').value);
    el('crDetalle').textContent=servicio?`${servicio.duracion} minutos aprox. · ${servicio.desdePrecio?'Desde ':''}${precio(servicio.precio)}`:'';
    const barberos=catalogo?catalogo.barberos.filter(b=>catalogo.asignaciones.some(a=>a.barberoId===b.id && a.servicioId===el('crServicio').value)):[];
    opciones('crBarbero',barberos,'Elegí un barbero');
    if(barberos.length===1)el('crBarbero').value=barberos[0].id;
    cargarHorarios();
  });
  el('crBarbero').addEventListener('change',cargarHorarios);
  async function cargarHorarios() {
    const req=++secuencia; hora=''; el('crConfirm').disabled=true; el('crSlots').replaceChildren();
    const fecha=el('crFecha').value,barberoId=el('crBarbero').value,servicioId=el('crServicio').value;
    if(!fecha||!barberoId||!servicioId){el('crSlotHint').textContent='Elegí servicio, barbero y fecha.';return;}
    el('crSlotHint').textContent='Consultando disponibilidad...';
    try {
      const times=await api.disponibilidad(fecha,barberoId,servicioId);
      if(req!==secuencia)return;
      el('crSlotHint').textContent=times.length?'Seleccioná un horario disponible.':'No hay turnos para esta fecha.';
      times.forEach(t=>{
        const btn=document.createElement('button');btn.type='button';btn.className='cr-slot';btn.textContent=t;
        btn.setAttribute('aria-pressed','false');
        btn.addEventListener('click',()=>{
          el('crSlots').querySelectorAll('.cr-slot').forEach(b=>b.setAttribute('aria-pressed','false'));
          btn.setAttribute('aria-pressed','true');hora=t;el('crConfirm').disabled=ocupada;
        });
        el('crSlots').append(btn);
      });
    } catch(err) {if(req===secuencia)el('crSlotHint').textContent=err.message;}
  }
  el('crForm').addEventListener('submit',async event=>{
    event.preventDefault();if(ocupada||!hora||!el('crFecha').value)return;
    ocupada=true;el('crConfirm').disabled=true;aviso('Registrando tu reserva...');
    const reserva={servicioId:el('crServicio').value,barberoId:el('crBarbero').value,fecha:el('crFecha').value,hora,nombre:el('crNombre').value,telefono:el('crTelefono').value};
    try {
      const result=await api.reservar(reserva);
      aviso(`¡Turno confirmado!\n${result.servicio}\n${result.fecha} a las ${result.hora}\nPrecio de referencia: ${precio(result.precio)}\nGuardá esta información.`, 'success');
      hora='';
    } catch(err) {
      aviso(err.message+' Si hubo un problema de conexión, consultá con la barbería antes de intentar reservar otra vez.','error');
    } finally {
      ocupada=false; await cargarHorarios();
    }
  });
})();
