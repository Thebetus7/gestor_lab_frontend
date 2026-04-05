# Frontend Web - GestorLab +

Desarrollado con **Next.js (App Router)**.

## Filosofía del Diseño
Construido siguiendo las sugerencias iniciales:
- Minimalista, veloz, sin configuraciones complejas visuales. CSS Puro (`Vanilla CSS` cargado en `globals.css`).
- Layout estilo Jetstream con una **barra superior** fija al top (100% de width) para que el scroll solo afecte al cuerpo principal.

## Conexiones y Arquitectura
- **Rutas y API**: La interacción con la base de datos de Django está separada y modulada en la carpeta `src/lib/api`. Aquí residen las funciones (`auth.ts`, etc) que mandan los REST API Requests mediante Fetch API.
- **Seguridad**: Se establece la Autenticación mediante **JSON Web Tokens (JWT)**.
   - Una petición al Backend en `/login` retorna el access_token y refresh_token.
   - Guardamos este access_token en el navegador. (Actualmente por simplicidad en `document.cookie`).
   - El archivo `src/middleware.ts` monitorea todas las rutas (como `/dashboard`). Si no encuentra una validación o firma válida de la cookie, expulsa al usuario devuelta al `/login`.

## Puesta en Marcha
1. Configurar variables de entorno `.env.local` si fuera necesario (`NEXT_PUBLIC_API_URL=http://localhost:8000/api`).
2. Instalar dependencias `npm install`.
3. Iniciar entorno dev: `npm run dev`.
