const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 4000;

// ========================================
// CORS
// ========================================

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://elambarberstudio.netlify.app",
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());

// ========================================
// HEALTH CHECK
// ========================================

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      service: "Elam Barber API",
      database: "connected",
    });
  } catch (error) {
    console.error("Error en health check:", error);

    res.status(500).json({
      status: "error",
      service: "Elam Barber API",
      database: "disconnected",
    });
  }
});

// ========================================
// SERVICIOS
// ========================================

app.get("/api/services", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM services");

    const formattedServices = rows.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      durationMinutes: service.duration_minutes,
      price: parseFloat(service.price),
      category: service.category,
      includesBrows: Boolean(service.includes_brows),
      isPromo: Boolean(service.is_promo),
    }));

    res.status(200).json(formattedServices);
  } catch (error) {
    console.error("Error al obtener servicios:", error);

    res.status(500).json({
      error: "Error al obtener los servicios",
    });
  }
});

// ========================================
// BARBEROS
// ========================================

app.get("/api/barbers", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM barbers");

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener barberos:", error);

    res.status(500).json({
      error: "Error al obtener los barberos",
    });
  }
});

// ========================================
// CREAR RESERVA
// ========================================

app.post("/api/appointments", async (req, res) => {
  const {
    barberName,
    serviceId,
    clientName,
    clientPhone,
    date,
    startTime,
    endTime,
  } = req.body;

  // ----------------------------------------
  // Validar datos obligatorios
  // ----------------------------------------

  if (
    !barberName ||
    !serviceId ||
    !clientName ||
    !clientPhone ||
    !date ||
    !startTime ||
    !endTime
  ) {
    return res.status(400).json({
      error: "Faltan datos obligatorios para la reserva.",
    });
  }

  try {
    // ----------------------------------------
    // Verificar que el servicio exista
    // ----------------------------------------

    const [services] = await db.query(
      "SELECT id FROM services WHERE id = ? LIMIT 1",
      [serviceId]
    );

    if (services.length === 0) {
      return res.status(404).json({
        error: "El servicio seleccionado no existe.",
      });
    }

    // ----------------------------------------
    // Verificar horario ocupado
    // ----------------------------------------

    const [existingAppointments] = await db.query(
      `
      SELECT id
      FROM appointments
      WHERE barber_name = ?
        AND appointment_date = ?
        AND start_time = ?
      LIMIT 1
      `,
      [barberName, date, startTime]
    );

    if (existingAppointments.length > 0) {
      return res.status(409).json({
        error: "Ese horario ya está reservado.",
      });
    }

    // ----------------------------------------
    // Crear reserva
    // ----------------------------------------

    const query = `
      INSERT INTO appointments (
        barber_name,
        service_id,
        client_name,
        client_phone,
        appointment_date,
        start_time,
        end_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      barberName,
      serviceId,
      clientName,
      clientPhone,
      date,
      startTime,
      endTime,
    ]);

    // ----------------------------------------
    // Respuesta
    // ----------------------------------------

    res.status(201).json({
      message: "Reserva registrada correctamente",
      appointmentId: result.insertId,
    });
  } catch (error) {
    console.error("Error al guardar reserva:", error);

    res.status(500).json({
      error: "Error al guardar la reserva en la base de datos",
    });
  }
});

// ========================================
// RUTA NO ENCONTRADA
// ========================================

app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

app.listen(PORT, () => {
  console.log(
    `Servidor de Elam Barber corriendo en http://localhost:${PORT}`
  );
});