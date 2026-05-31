const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM usuarios WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'No autenticado' });
  res.json({ username: req.session.username });
});

module.exports = router;
