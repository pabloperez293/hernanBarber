# Elam Barber Studio 💈

Sitio web y sistema de gestión de turnos para Elam Barber Studio.

El proyecto comenzó como una interfaz web estática y evolucionó hacia una aplicación frontend moderna con React, Vite y Tailwind CSS. El objetivo de esta etapa es construir posteriormente un backend con Java + Spring Boot y PostgreSQL para gestionar turnos, servicios, clientes y administración.

---

## 🎯 Objetivo del proyecto

Crear una plataforma digital para Elam Barber Studio que permita:

- Mostrar información del estudio.
- Presentar servicios y precios.
- Mostrar trabajos realizados.
- Facilitar el contacto con el negocio.
- Permitir reservas de turnos.
- Gestionar posteriormente turnos, servicios y disponibilidad desde un panel administrativo.

---

# 🖥️ Frontend

## Tecnologías

- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- React Icons
- Netlify
- Git / GitHub

---

## 🎨 Identidad visual

### Colores principales

- Fondo oscuro: `#0B0B0B`
- Dorado: `#DDC88A`
- Verde oscuro: `#076428`
- Texto principal: `#FFFFFF`

### Identidad de marca

**Familia, Confort & Calidad**

---

# 📁 Estructura actual

```text
ElamBarberStudio/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── client/
│   │   │   └── BookingStepper.jsx
│   │   ├── home/
│   │   │   ├── Hero.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── Gallery.jsx
│   │   │   └── Location.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   └── scrollToHasElement/
│   │       └── ScrollToHashElement.jsx
│   │
│   ├── data/
│   │   └── mockData.js
│   │
│   ├── utils/
│   │   └── bookingUtils.js
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
├── tailwind.config.js
└── README.md