import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // sirve /public

// "Base de datos" en memoria para la demo
const matriculas = [];

// Landing -> formulario
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Utilidades simples
const s = (v) => String(v ?? "").trim();
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// POST de matrícula (simulado)
app.post("/matricular", (req, res) => {
  const data = {
    nombres: s(req.body.nombres),
    apellidos: s(req.body.apellidos),
    documento: s(req.body.documento),
    email: s(req.body.email),
    telefono: s(req.body.telefono),
    programa: s(req.body.programa),
    modalidad: s(req.body.modalidad),
    inicio: s(req.body.inicio),
  };

  const errores = [];
  if (!data.nombres) errores.push("Nombres es obligatorio");
  if (!data.apellidos) errores.push("Apellidos es obligatorio");
  if (!data.documento) errores.push("Documento es obligatorio");
  if (!isEmail(data.email)) errores.push("Email no válido");
  if (!data.programa) errores.push("Programa es obligatorio");

  if (errores.length) {
    return res.status(400).send(`
      <!doctype html><html lang="es"><head>
      <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
      <title>Errores en matrícula</title></head>
      <body class="bg-light"><div class="container py-5">
        <h1 class="h4 mb-3">Corrige los siguientes errores</h1>
        <ul class="text-danger">${errores.map(e => `<li>${e}</li>`).join("")}</ul>
        <a href="/" class="btn btn-primary mt-3">Volver al formulario</a>
      </div></body></html>
    `);
  }

  const id = crypto.randomBytes(4).toString("hex");
  const ts = new Date().toISOString();
  matriculas.push({ id, ts, ...data });

  res.send(`
    <!doctype html><html lang="es"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <title>Comprobante de matrícula</title></head>
    <body class="bg-light"><div class="container py-5">
      <div class="card shadow">
        <div class="card-body">
          <h1 class="h4 mb-3">¡Matrícula registrada!</h1>
          <p class="mb-2">Código: <strong>${id}</strong></p>
          <p class="text-muted mb-4">Fecha: ${new Date(ts).toLocaleString()}</p>
          <dl class="row">
            <dt class="col-sm-3">Alumno</dt><dd class="col-sm-9">${data.nombres} ${data.apellidos}</dd>
            <dt class="col-sm-3">Documento</dt><dd class="col-sm-9">${data.documento}</dd>
            <dt class="col-sm-3">Programa</dt><dd class="col-sm-9">${data.programa}</dd>
            <dt class="col-sm-3">Modalidad</dt><dd class="col-sm-9">${data.modalidad}</dd>
            <dt class="col-sm-3">Inicio</dt><dd class="col-sm-9">${data.inicio}</dd>
            <dt class="col-sm-3">Email</dt><dd class="col-sm-9">${data.email}</dd>
            <dt class="col-sm-3">Teléfono</dt><dd class="col-sm-9">${data.telefono || "-"}</dd>
          </dl>
          <a href="/" class="btn btn-primary">Nueva matrícula</a>
        </div>
      </div>
    </div></body></html>
  `);
});

// Endpoint para ver lo registrado (solo demo)
app.get("/admin/matriculas", (_, res) => {
  res.json({ total: matriculas.length, items: matriculas });
});

// Healthcheck
app.get("/health", (_, res) =>
  res.json({ ok: true, env: "prod", ts: new Date().toISOString() })
);

app.listen(port, () => console.log(`Listening on ${port}`));
