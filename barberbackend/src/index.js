const express = require("express");
const cors = require("cors");
const db = require("./config/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 1. Obtener todos los servicios
app.get("/api/services", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM services");
    // Formatear nombres de propiedades para que coincidan con React camelCase
    const formattedServices = rows.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      durationMinutes: s.duration_minutes,
      price: parseFloat(s.price),
      category: s.category,
      includesBrows: Boolean(s.includes_brows),
      isPromo: Boolean(s.is_promo),
    }));
    res.json(formattedServices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los servicios" });
  }
});

// 2. Obtener todos los barberos
app.get("/api/barbers", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM barbers");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los barberos" });
  }
});

// 3. Registrar una reserva
app.post("/api/appointments", async (req, res) => {
  const { barberName, serviceId, clientName, clientPhone, date, startTime, endTime } = req.body;

  if (!barberName || !serviceId || !clientName || !clientPhone || !date || !startTime || !endTime) {
    return res.status(400).json({ error: "Faltan datos obligatorios para la reserva." });
  }

  try {
    const query = `
      INSERT INTO appointments (barber_name, service_id, client_name, client_phone, appointment_date, start_time, end_time)
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

    res.status(201).json({
      message: "Reserva registrada correctamente",
      appointmentId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar la reserva en la base de datos" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de Elam Barber corriendo en http://localhost:${PORT}`);
});