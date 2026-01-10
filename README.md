#  HernanBarber - Sistema de Gestión de Turnos

Plataforma web para la barbería "Hernan Barber" que permite a los clientes reservar turnos en línea, ver servicios disponibles y dejar opiniones.

---

## 📁 Estructura del Proyecto

```
hernanBarber/
├── index.html              # Página principal
├── admin/                  # Sección administrativa
│   ├── dashboard.html      # Panel de control
│   └── login.html          # Formulario de login admin
├── pages/                  # Páginas principales del sitio
│   ├── barberias.html      # Información de sucursales
│   ├── login.html          # Formulario de login cliente
│   ├── opiniones.html      # Opiniones de clientes
│   ├── servicios.html      # Catálogo de servicios
│   ├── turnos.html         # Sistema de reserva de turnos
│   └── ubicciones.html     # Ubicaciones de las sucursales
├── js/                     # Archivos JavaScript
│   ├── login.js            # Lógica de autenticación
│   └── turnos.js           # Sistema de generación y validación de turnos
├── css/                    # Estilos
│   └── styles.css          # Estilos principales
├── assets/                 # Recursos
│   └── img/                # Imágenes del sitio
└── README.md              # Este archivo
```

---

## Funcionalidades Principales

###  Sistema de Reserva de Turnos 

#### Características:
- ✅ **Selector de fecha con validaciones:**
  - Solo permite seleccionar fechas a partir de hoy
  - Límite máximo: último día del mes actual
  - No es posible seleccionar fechas pasadas
  - Impide seleccionar fechas fuera del mes vigente

- ✅ **Selector de horarios dinámico:**
  - Se actualiza según la fecha seleccionada
  - Para hoy: solo muestra horarios disponibles desde la hora actual en adelante
  - Redondea al próximo bloque de 30 minutos
  - Si no hay horarios disponibles, muestra "No hay horarios disponibles"
  - Horario de atención: **9:00 AM - 8:00 PM**

- ✅ **Servicios con duraciones:**
  - **Corte:** 30 minutos
  - **Barba:** 30 minutos
  - **Corte + Barba:** 30 minutos
  - **Claritos:** 60 minutos

- ✅ **Cálculo automático de hora de finalización:**
  - Se calcula en base al servicio seleccionado
  - Muestra la hora de fin junto a la hora de inicio

- ✅ **Validación de teléfono:**
  - Solo acepta números
  - Rechaza caracteres especiales y letras
  - Compatible con copiar/pegar

### 👤 Autenticación 
- Sistema de login para clientes y administradores
- Validación de credenciales

### 📄 Otras Secciones
- **Barberias:** Información de sucursales
- **Servicios:** Catálogo de servicios disponibles
- **Opiniones:** Reseñas de clientes
- **Ubicaciones:** Mapa y direcciones de las sucursales
- **Dashboard Admin:** Panel de control (para administradores)

---

##  Archivos JavaScript


Sistema completo de validación y generación de turnos con las siguientes características:

**Variables principales:**
- `DURACIONES`: Objeto con la duración de cada servicio en minutos
- `HORA_APERTURA`: 9 (9:00 AM)
- `HORA_CIERRE`: 20 (8:00 PM)

**Funciones principales:**

#### `generarHorarios()`
- Genera dinámicamente los horarios disponibles según la fecha seleccionada
- Si la fecha es hoy, filtra horarios pasados
- Deshabilita el selector si no hay horarios disponibles

#### `calcularHoraFin()`
- Calcula la hora de finalización del turno
- Basado en la hora de inicio y la duración del servicio

**Eventos:**
```javascript
fechaInput.addEventListener("change", generarHorarios);
servicioSelect.addEventListener("change", calcularHoraFin);
horaInicioSelect.addEventListener("change", calcularHoraFin);
```

**Validaciones implementadas:**
1. ✅ No permite seleccionar fechas pasadas
2. ✅ Limita las fechas al mes actual
3. ✅ Filtra horarios pasados para la fecha actual
4. ✅ Solo genera horarios dentro de 09:00 - 20:00
5. ✅ Redondea correctamente los horarios al próximo bloque de 30 min
6. ✅ Valida campos de teléfono (solo números)

###
Manejo de autenticación y validación de formularios de login.

---

##  Estilos

### `css/styles.css`
Estilos responsivos para toda la plataforma, incluyendo:
- Diseño moderno y atractivo
- Colores corporativos de la barbería
- Elementos interactivos
- Validación visual de formularios

## 🚀 Cómo Usar

### Reservar un Turno
1. Ir a **Turnos** en el menú principal
2. Seleccionar la **fecha** (entre hoy y el final del mes)
3. Seleccionar el **servicio** deseado
4. El sistema mostrará automáticamente los **horarios disponibles**
5. Seleccionar la **hora de inicio**
6. La **hora de fin** se calcula automáticamente
7. Completar los datos personales
8. Hacer clic en **Confirmar** para reservar

### Casos Especiales
- **Si intentas seleccionar una fecha pasada:** El sistema la rechaza y coloca la fecha actual
- **Si intentas seleccionar una fecha fuera del mes:** El sistema la rechaza y coloca el último día del mes
- **Si es tarde y no hay horarios disponibles hoy:** El selector muestra "No hay horarios disponibles"
- **Si intentas escribir letras en el teléfono:** El sistema solo mantiene los números



##  Requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- HTML5 compatible

## 🔄 Última Actualización

**Fecha:** 10 de enero de 2026

**Cambios Recientes:**
- ✅ Implementación de validaciones de fecha (no permite fechas pasadas)
- ✅ Límite de mes actual para el selector de fechas
- ✅ Filtrado de horarios pasados para la fecha actual
- ✅ Validación de solo números en campos de teléfono
- ✅ Mejora en la lógica de disponibilidad de horarios
- ✅ Mensajes de error mejorados


## 📝 Notas de Desarrollo

### Mejoras Futuras
- [ ] Integración con base de datos para persistencia de reservas
- [ ] Sistema de confirmación por email
- [ ] Recordatorios por SMS
- [ ] Dashboard de administrador completo
- [ ] Sincronización con calendario
- [ ] Carrito de servicios múltiples

### Consideraciones Técnicas
- Las fechas se validan con formato ISO `YYYY-MM-DD`
- Los horarios se generan en intervalos de 30 minutos
- La hora actual se redondea al próximo intervalo de 30 minutos
- Los campos telefónicos se limpian en tiempo real


## 👨‍💼 Autor

Sistema de gestión desarrollado para **HernanBarber**


## 📞 Contacto

Para reportar problemas o sugerir mejoras, contactar al equipo de desarrollo.
1157576175
