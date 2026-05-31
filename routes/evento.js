const router = require('express').Router();
const db = require('../db/database');

function auth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'No autenticado' });
  next();
}

router.get('/evento', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM eventos WHERE id=1').get());
});

router.patch('/evento', auth, (req, res) => {
  const { nombre1, nombre2, fecha, hora, lugar, misa_hora, misa_lugar, mensaje } = req.body;
  const e = db.prepare('SELECT * FROM eventos WHERE id=1').get();
  db.prepare(`UPDATE eventos SET nombre1=?,nombre2=?,fecha=?,hora=?,lugar=?,misa_hora=?,misa_lugar=?,mensaje=? WHERE id=1`)
    .run(nombre1??e.nombre1, nombre2??e.nombre2, fecha??e.fecha, hora??e.hora,
         lugar??e.lugar, misa_hora??e.misa_hora, misa_lugar??e.misa_lugar, mensaje??e.mensaje);
  res.json(db.prepare('SELECT * FROM eventos WHERE id=1').get());
});

// Mesas
router.get('/mesas', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM mesas WHERE evento_id=1 ORDER BY id').all());
});
router.post('/mesas', auth, (req, res) => {
  const { nombre, capacidad } = req.body;
  const r = db.prepare('INSERT INTO mesas (nombre, capacidad) VALUES (?,?)').run(nombre||'Nueva Mesa', capacidad||8);
  res.json(db.prepare('SELECT * FROM mesas WHERE id=?').get(r.lastInsertRowid));
});
router.patch('/mesas/:id', auth, (req, res) => {
  const { nombre, capacidad } = req.body;
  const m = db.prepare('SELECT * FROM mesas WHERE id=?').get(req.params.id);
  if (!m) return res.status(404).json({ error: 'No encontrada' });
  db.prepare('UPDATE mesas SET nombre=?,capacidad=? WHERE id=?').run(nombre??m.nombre, capacidad??m.capacidad, m.id);
  res.json(db.prepare('SELECT * FROM mesas WHERE id=?').get(m.id));
});
router.delete('/mesas/:id', auth, (req, res) => {
  db.prepare('UPDATE invitados SET mesa=0 WHERE mesa=?').run(req.params.id);
  db.prepare('DELETE FROM mesas WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
router.patch('/mesas/:mesaId/invitado/:invId', auth, (req, res) => {
  db.prepare('UPDATE invitados SET mesa=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')
    .run(parseInt(req.params.mesaId), req.params.invId);
  res.json({ ok: true });
});

module.exports = router;
