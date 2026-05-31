const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'rsvp.db');

// Crear el directorio si no existe
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre1 TEXT NOT NULL DEFAULT 'Novia',
    nombre2 TEXT NOT NULL DEFAULT 'Novio',
    fecha TEXT NOT NULL DEFAULT '2027-01-01',
    hora TEXT NOT NULL DEFAULT '20:00',
    lugar TEXT NOT NULL DEFAULT 'Por definir',
    misa_hora TEXT DEFAULT '17:00',
    misa_lugar TEXT DEFAULT '',
    mensaje TEXT DEFAULT 'Los esperamos con todo nuestro amor.',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS invitados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id INTEGER NOT NULL DEFAULT 1,
    nombre TEXT NOT NULL,
    personas INTEGER NOT NULL DEFAULT 1,
    mesa INTEGER DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK(estado IN ('Confirmado','Pendiente','No asiste')),
    mensaje TEXT DEFAULT '',
    token TEXT UNIQUE,
    whatsapp TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evento_id) REFERENCES eventos(id)
  );

  CREATE TABLE IF NOT EXISTS mesas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id INTEGER NOT NULL DEFAULT 1,
    nombre TEXT NOT NULL,
    capacidad INTEGER NOT NULL DEFAULT 8,
    FOREIGN KEY (evento_id) REFERENCES eventos(id)
  );
`);

// Agregar columnas misa si no existen
try { db.exec(`ALTER TABLE eventos ADD COLUMN misa_hora TEXT DEFAULT '17:00'`); } catch {}
try { db.exec(`ALTER TABLE eventos ADD COLUMN misa_lugar TEXT DEFAULT ''`); } catch {}

// Seed evento real
const evento = db.prepare('SELECT id FROM eventos WHERE id = 1').get();
if (!evento) {
  db.prepare(`INSERT INTO eventos (nombre1, nombre2, fecha, hora, lugar, misa_hora, misa_lugar, mensaje)
    VALUES ('Mónica','Eduardo','2027-01-01','20:00','Jardín Casta Brava','17:00','Templo del Perpetuo Socorro','Los esperamos con todo nuestro amor.')`).run();
}

const adminUser = db.prepare('SELECT id FROM usuarios WHERE username = ?').get('admin');
if (!adminUser) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO usuarios (username, password_hash) VALUES (?,?)').run('admin', hash);
}

module.exports = db;
