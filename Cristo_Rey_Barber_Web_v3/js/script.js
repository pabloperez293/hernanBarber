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
// Clonamos las tarjetas para crear un recorrido continuo sin saltos visuales.
const originals = [...track.children];
originals.forEach((card) => {
  const clone = card.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  clone.tabIndex = -1;
  track.appendChild(clone);
});
let running = true;
let last = 0;
const speed = 0.45;
function animateGallery(now) {
  if (!last) last = now;
  const delta = Math.min(now - last, 50);
  last = now;
  if (running) {
    track.scrollLeft += (speed * delta) / 16.67;
    const firstHalf = track.scrollWidth / 2;
    if (track.scrollLeft >= firstHalf) track.scrollLeft -= firstHalf;
  }
  requestAnimationFrame(animateGallery);
}
requestAnimationFrame(animateGallery);
track.addEventListener("pointerenter", () => (running = false));
track.addEventListener("pointerleave", () => (running = true));
track.addEventListener("focusin", () => (running = false));
track.addEventListener("focusout", () => (running = true));
const dialog = $("#lightbox");
document.querySelectorAll(".gallery-card").forEach((b) =>
  b.addEventListener("click", () => {
    $("#lightboxImage").src = b.dataset.image;
    dialog.showModal();
  }),
);
$("#closeLightbox").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
$("#year").textContent = new Date().getFullYear();
// REEMPLAZAR estos enlaces con los datos oficiales de Cristo Rey Barber.
// No se muestran enlaces inventados: los botones sin URL se desactivan.
const links = {
  bookingLink: "",
  instagram: "",
  whatsapp: "",
  reviews: "",
  maps: "",
};
Object.entries(links).forEach(([id, url]) => {
  const a = document.getElementById(id);
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
