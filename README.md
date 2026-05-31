# Boda Mónica Rivera Bracho & Eduardo Castañeda Cuevas — Sistema RSVP

## Cómo correr localmente

```bash
npm install
npm run dev
# Abre: http://localhost:3000
# Usuario: admin | Contraseña: admin123
```

## Rutas
| URL | Descripción |
|-----|-------------|
| `/` | Página pública de la boda (para compartir en redes) |
| `/rsvp/:token` | Página personal de cada invitado para confirmar |
| `/admin` → login | Panel de administración |

## Flujo de uso
1. Entra al panel → "Invitación" → configura fecha, lugar y mensaje
2. Ve a "Asistencia" → agrega invitados con su número de WhatsApp
3. Presiona el botón verde "WhatsApp" → se abre WhatsApp Web con el mensaje y enlace ya escritos
4. El invitado abre su enlace, confirma y deja un mensaje
5. Gestiona mesas en la pestaña "Mesas"

## Desplegar gratis en Railway

```bash
npm install -g @railway/cli
railway login
railway init      # elige "Empty project"
railway up
```

### Variables de entorno en Railway:
| Variable | Valor |
|----------|-------|
| `SESSION_SECRET` | cadena aleatoria larga (ej: `openssl rand -hex 32`) |
| `NODE_ENV` | `production` |

Railway asigna `PORT` automáticamente.

## Cambiar contraseña
En `db/database.js` cambia `admin123` antes del primer deploy.
