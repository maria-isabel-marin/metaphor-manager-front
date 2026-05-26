# Despliegue de Frontend (Next.js) en Railway

## 1. Requisitos previos
- Tener una cuenta en [Railway](https://railway.app/)
- Tener el código del frontend en un repositorio de GitHub
- Tener el backend desplegado en Railway y su URL pública

## 2. Variables de entorno necesarias
Crea un archivo `.env.production` (no lo subas a git) con:
```
NEXT_PUBLIC_API_URL=https://<tu-backend-en-railway>.up.railway.app
NODE_ENV=production
```

## 3. Scripts de build y start
Asegúrate de tener en tu `package.json`:
```json
"scripts": {
  "build": "next build",
  "start": "next start"
}
```

## 4. Despliegue en Railway
1. Sube tu código a GitHub.
2. En Railway, crea un nuevo proyecto y elige “Deploy from GitHub repo”.
3. Agrega las variables de entorno en el panel de Railway (`NEXT_PUBLIC_API_URL`, `NODE_ENV`).
4. Railway ejecutará automáticamente los scripts de build y start.
5. Verifica los logs y la URL pública del frontend.

## 5. Recomendaciones de optimización
- Elimina dependencias de desarrollo antes del build: `npm prune --production`
- No subas archivos grandes ni `.env` a git.
- Usa `NODE_ENV=production` para optimizar el rendimiento.

## 6. Seguridad
- Nunca subas tus credenciales a git.
- Usa variables de entorno para todo lo sensible.

---
¡Listo! Tu frontend estará disponible en Railway y conectado al backend en producción. 