const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.SESSION_SECRET || 'rsvp-secret-cambia-en-produccion';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.use(express.static(path.join(__dirname, 'public')));

// Public event endpoint (for RSVP page)
app.get('/api/pub/evento', (req, res) => {
  const db = require('./db/database');
  const ev = db.prepare('SELECT nombre1,nombre2,fecha,hora,lugar,misa_hora,misa_lugar,mensaje FROM eventos WHERE id=1').get();
  res.json(ev || {});
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/invitados', require('./routes/invitados'));
app.use('/api', require('./routes/evento'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✦ Boda Mónica & Eduardo — http://localhost:${PORT}`);
  console.log(`   usuario: admin | contraseña: admin123`);
});
