const router = require('express').Router();
const db = require('../db/database');
const crypto = require('crypto');

function auth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'No autenticado' });
  next();
}

router.get('/', auth, (req, res) => {
  const invitados = db.prepare('SELECT * FROM invitados WHERE evento_id = 1 ORDER BY nombre').all();
  res.json(invitados);
});

router.get('/stats', auth, (req, res) => {
  const total      = db.prepare('SELECT COUNT(*) as c FROM invitados WHERE evento_id=1').get().c;
  const confirmados= db.prepare("SELECT COUNT(*) as c FROM invitados WHERE evento_id=1 AND estado='Confirmado'").get().c;
  const pendientes = db.prepare("SELECT COUNT(*) as c FROM invitados WHERE evento_id=1 AND estado='Pendiente'").get().c;
  const noAsisten  = db.prepare("SELECT COUNT(*) as c FROM invitados WHERE evento_id=1 AND estado='No asiste'").get().c;
  const personas   = db.prepare("SELECT COALESCE(SUM(personas),0) as c FROM invitados WHERE evento_id=1 AND estado='Confirmado'").get().c;
  res.json({ total, confirmados, pendientes, noAsisten, personas });
});

router.post('/', auth, (req, res) => {
  const { nombre, personas, mesa, estado, whatsapp } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
  const token = crypto.randomBytes(12).toString('hex');
  const result = db.prepare(
    'INSERT INTO invitados (nombre, personas, mesa, estado, whatsapp, token) VALUES (?,?,?,?,?,?)'
  ).run(nombre, personas || 1, mesa || 0, estado || 'Pendiente', whatsapp || '', token);
  res.json(db.prepare('SELECT * FROM invitados WHERE id=?').get(result.lastInsertRowid));
});

router.patch('/:id', auth, (req, res) => {
  const { nombre, personas, mesa, estado, mensaje, whatsapp } = req.body;
  const inv = db.prepare('SELECT * FROM invitados WHERE id=?').get(req.params.id);
  if (!inv) return res.status(404).json({ error: 'No encontrado' });
  db.prepare(`UPDATE invitados SET nombre=?,personas=?,mesa=?,estado=?,mensaje=?,whatsapp=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(nombre??inv.nombre, personas??inv.personas, mesa??inv.mesa, estado??inv.estado, mensaje??inv.mensaje, whatsapp??inv.whatsapp, inv.id);
  res.json(db.prepare('SELECT * FROM invitados WHERE id=?').get(inv.id));
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM invitados WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// PUBLIC: get invite info
router.get('/confirmar/:token', (req, res) => {
  const inv = db.prepare('SELECT * FROM invitados WHERE token=?').get(req.params.token);
  if (!inv) return res.status(404).json({ error: 'Invitación no encontrada' });
  const evento = db.prepare('SELECT * FROM eventos WHERE id=1').get();
  res.json({ invitado: inv, evento });
});

// PUBLIC: confirm attendance
router.post('/confirmar/:token', (req, res) => {
  const { estado, mensaje } = req.body;
  const inv = db.prepare('SELECT * FROM invitados WHERE token=?').get(req.params.token);
  if (!inv) return res.status(404).json({ error: 'Invitación no encontrada' });
  if (!['Confirmado','No asiste'].includes(estado))
    return res.status(400).json({ error: 'Estado inválido' });
  db.prepare(`UPDATE invitados SET estado=?,mensaje=?,updated_at=CURRENT_TIMESTAMP WHERE token=?`)
    .run(estado, mensaje || '', req.params.token);
  res.json({ ok: true, estado });
});

module.exports = router;
