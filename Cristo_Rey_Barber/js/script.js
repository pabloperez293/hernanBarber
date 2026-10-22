const $ = (s) => document.querySelector(s);
const loader = $("#loader");
const hideLoader = () => loader.classList.add("hide");
window.addEventListener("load", () => setTimeout(hideLoader, 1100));
setTimeout(hideLoader, 3200);
const menu = $("#menuToggle"),
  nav = $("#nav");
menu.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute(
    "aria-label",
    open ? "Cerrar navegación" : "Abrir navegación",
  );
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Abrir navegación");
  }),
);
const obs = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    }),
  { threshold: 0.08 },
);
document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
const track = $("#galleryTrack");
const originals = [...track.children];
originals.forEach((card) => {
  const clone = card.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  clone.tabIndex = -1;
  track.appendChild(clone);
});
let running = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lastTime = 0;
let loopWidth = 0;
function measureGallery() {
  if (!originals.length) return;
  const first = originals[0].getBoundingClientRect();
  const duplicate = track.children[originals.length].getBoundingClientRect();
  loopWidth = duplicate.left - first.left;
}
window.addEventListener("load", measureGallery);
window.addEventListener("resize", measureGallery);
function animateGallery(now) {
  if (!lastTime) lastTime = now;
  const delta = Math.min(now - lastTime, 50);
  lastTime = now;
  if (running && loopWidth) {
    track.scrollLeft += delta * 0.035;
    if (track.scrollLeft >= loopWidth) track.scrollLeft -= loopWidth;
  }
  requestAnimationFrame(animateGallery);
}
requestAnimationFrame(animateGallery);
track.addEventListener("pointerenter", () => (running = false));
track.addEventListener("pointerleave", () => (running = true));
track.addEventListener("focusin", () => (running = false));
track.addEventListener("focusout", () => (running = true));
const dialog = $("#lightbox");
track.addEventListener("click", (e) => {
  const b = e.target.closest(".gallery-card");
  if (!b) return;
  $("#lightboxImage").src = b.dataset.image;
  dialog.showModal();
});
$("#closeLightbox").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
$("#year").textContent = new Date().getFullYear();
// REEMPLAZAR estos enlaces con los datos oficiales de Cristo Rey Barber.
// No se muestran enlaces inventados: los botones sin URL se desactivan.
const links = {
  bookingLink:
    "https://wa.me/5491138694111?text=Hola%20Hern%C3%A1n%2C%20quisiera%20consultar%20disponibilidad%20para%20un%20turno",
  instagram: "https://www.instagram.com/cristoreybarber/",
  whatsapp: "https://wa.me/5491138694111",
  reviews: "",
  maps: "https://maps.app.goo.gl/XEMhu7P5Gshb9GSm7",
};
Object.entries(links).forEach(([id, url]) => {
  const a = document.getElementById(id);
  // Fase 2: el botón antiguo de WhatsApp fue reemplazado por la agenda.
  if (!a) return;
  if (!url) {
    a.setAttribute("aria-disabled", "true");
    a.title = "Próximamente: falta configurar el enlace oficial";
    a.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Próximamente: estamos configurando este enlace.");
    });
  } else {
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
});
