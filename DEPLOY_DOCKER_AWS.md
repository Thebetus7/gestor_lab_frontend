# Despliegue Frontend (Next.js) en AWS - CON DOCKER

Esta guía describe cómo empaquetar y desplegar el frontend de **GestorLab** (desarrollado con Next.js) en una instancia EC2 de AWS usando **Docker** y **Docker Compose**.

---

## ⚙️ Configuración de la URL del Backend (importante)

El frontend se conecta al backend Django a través de la variable **`NEXT_PUBLIC_API_URL`**. Si esta URL es incorrecta, verás errores de conexión o login fallido aunque el backend esté funcionando (como ya ocurre en móvil cuando apunta al puerto equivocado).

### URL correcta vs incorrecta

El backend en AWS (con Docker) expone el puerto **80** hacia internet. Dentro del contenedor Django escucha en **8000**, pero **desde el navegador, el móvil o el frontend NO debes usar `:8000`**.

| Entorno | URL correcta | URL incorrecta |
|---|---|---|
| Backend en AWS (Docker) | `http://18.221.224.13/api` | `http://18.221.224.13:8000/api` |
| Desarrollo local (backend en tu PC) | `http://localhost:8000/api` | — |

**Ejemplo de producción para este proyecto:**

```env
NEXT_PUBLIC_API_URL=http://18.221.224.13/api
```

### Dónde se define en el código

Todas las peticiones HTTP del frontend pasan por `src/lib/api-client.ts`:

```typescript
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://18.221.224.13/api';
```

El login (`src/lib/api/auth.ts`) importa la misma constante, así que **login y resto de la app usan la misma URL**.

### Desarrollo local (`npm run dev`)

Crea un archivo `.env.local` en la raíz de `gestor_lab_frontend/`:

```env
# Backend desplegado en AWS
NEXT_PUBLIC_API_URL=http://18.221.224.13/api

# O backend corriendo en tu PC
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Reinicia el servidor de desarrollo después de cambiar `.env.local`:

```bash
npm run dev
```

### Producción con Docker (AWS)

En producción, Next.js **incrusta** `NEXT_PUBLIC_API_URL` durante el `npm run build`. Por eso debes configurarla en `docker-compose.yml` **antes** de `docker-compose up -d --build`. Si cambias la IP del backend, debes **reconstruir** el contenedor del frontend.

> **Regla:** sin `:8000` hacia AWS · con `/api` al final · usar `http://` (no `https://`) mientras no tengas certificado SSL.

### Versiones compatibles (no actualizar al azar en el servidor)

| Componente | Versión usada en GestorLab | Notas |
|---|---|---|
| AMI EC2 | Amazon Linux 2023 | No uses Ubuntu sin adaptar los comandos (`dnf` → `apt`) |
| Node.js (Docker) | `20-alpine` | Requerido por Next.js 16 |
| Next.js | `16.x` | Definido en `package.json` |
| React | `19.x` | Va ligado a Next 16 |
| Docker Buildx | **≥ 0.17.0** | En AL2023 instalar manualmente (sección 3.2) |
| Docker Compose | Último binario de GitHub | No usar `dnf install docker-compose` |
| `docker-buildx-plugin` (dnf) | **No disponible** | No intentes instalarlo con `dnf` |

**En el servidor NO ejecutes** `npm update`, `dnf update` de paquetes Node ni cambies versiones a mano. Los cambios de dependencias se hacen en tu PC, se prueban con `npm run build`, y se suben con `git push`. En AWS solo se ejecuta `docker-compose up -d --build`.

---

## 1. Archivos de Configuración Requeridos en tu Proyecto

Debes crear los siguientes archivos en la raíz de tu proyecto `gestor_lab_frontend/`:

### 📄 `Dockerfile`
Crearemos un archivo Docker de múltiples etapas (*multi-stage build*) para optimizar el tamaño de la imagen final:

```dockerfile
# Etapa 1: Construcción
FROM node:20-alpine AS builder
WORKDIR /app

# Limitar memoria de Node durante el build (útil en t2.micro con 1 GB RAM)
ENV NODE_OPTIONS="--max-old-space-size=768"

COPY package*.json ./
# npm ci usa package-lock.json y evita sorpresas al actualizar paquetes
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Etapa 2: Servidor de Producción
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]
```

> **Versiones del proyecto:** Next.js `16.x`, React `19.x`, Node `20` (Alpine). No uses Node 18 ni 22 sin probar antes; Node 20 es el compatible con este stack.

### 📄 `docker-compose.yml`
Docker Compose se encargará de inyectar la URL del backend durante la construcción del contenedor y mapeará el puerto `80` (HTTP) de la máquina al puerto `3000` de Next.js.

```yaml
services:
  frontend:
    build:
      context: .
      args:
        # IP pública del backend AWS — puerto 80, SIN :8000, CON /api al final
        - NEXT_PUBLIC_API_URL=http://18.221.224.13/api
    container_name: gestorlab_frontend
    restart: always
    ports:
      - "80:3000"
```

---

## 2. Crear la Instancia EC2 en AWS

1. **Nombre:** `gestorlab-frontend-docker`
2. **AMI:** **Amazon Linux 2023 AMI** (capa gratuita).
3. **Tipo de Instancia:** `t2.micro` o `t3.micro`.
4. **Par de claves (inicio de sesión - SSH):**
   * Haz clic en **"Crear un nuevo par de claves"** (si no tienes una).
   * Llámalo `gestorlab-frontend-key`.
   * Tipo de clave: **RSA**. Formato de archivo: **`.pem`**.
   * Presiona **Crear**. Tu navegador descargará automáticamente el archivo `gestorlab-frontend-key.pem`. **Guárdalo en un lugar seguro**, ya que lo usarás para conectarte por SSH.
5. **Configuraciones de red (Security Group):**
   - Permitir **SSH** (puerto `22`) desde cualquier lugar (`0.0.0.0/0`).
   - Permitir **HTTP** (puerto `80`) desde cualquier lugar (`0.0.0.0/0`) (el puerto que expondremos).
6. **Almacenamiento:** `8 GiB gp3` (por defecto).

---

## 3. Instalar Docker, Buildx y Docker Compose en la EC2

Conéctate por SSH a la EC2 del **frontend** y ejecuta los pasos **en orden**. No saltes ninguno.

> **¿Por qué Buildx es obligatorio?**  
> En **Amazon Linux 2023**, el paquete `docker` trae Buildx **0.12.1**, pero Docker Compose moderno exige **Buildx 0.17.0 o superior** para compilar imágenes (`docker-compose up --build`).  
> El paquete `docker-buildx-plugin` **no existe** en los repositorios de Amazon Linux 2023 (`No match for argument: docker-buildx-plugin`). Hay que instalar Buildx **manualmente**.

### 3.1 — Instalar Docker y Git

```bash
# Actualizar el sistema
sudo dnf update -y

# Instalar Docker y Git (NO incluye Buildx compatible con Compose)
sudo dnf install docker git -y

# Iniciar Docker y habilitarlo al arranque
sudo systemctl start docker
sudo systemctl enable docker

# Permitir que ec2-user use Docker sin sudo
sudo usermod -aG docker ec2-user
```

> [!IMPORTANT]
> Para aplicar el grupo `docker` en tu sesión actual:
> 1. Cierra SSH con `exit` y vuelve a conectarte, **o**
> 2. Ejecuta: `newgrp docker`

### 3.2 — Instalar Docker Buildx (obligatorio en Amazon Linux 2023)

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins

sudo curl -L "https://github.com/docker/buildx/releases/download/v0.19.3/buildx-v0.19.3.linux-amd64" \
  -o /usr/local/lib/docker/cli-plugins/docker-buildx

sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx
```

**Verificar versión** (debe ser **≥ 0.17.0**):

```bash
docker buildx version
```

**Si aún muestra `0.12.1`**, fuerza el plugin nuevo:

```bash
export DOCKER_CLI_PLUGIN_EXTRA_DIRS=/usr/local/lib/docker/cli-plugins
echo 'export DOCKER_CLI_PLUGIN_EXTRA_DIRS=/usr/local/lib/docker/cli-plugins' >> ~/.bashrc
source ~/.bashrc
docker buildx version
```

> **No continúes** si `docker buildx version` sigue en menos de `0.17.0`. Sin esto fallará:  
> `compose build requires buildx 0.17.0 or later`

### 3.3 — Instalar Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

docker --version
docker-compose --version
docker buildx version
```

**Checklist antes de desplegar:**

| Comando | Qué validar |
|---|---|
| `docker --version` | Docker instalado |
| `docker-compose --version` | Compose instalado |
| `docker buildx version` | Versión **≥ 0.17.0** (ideal: `v0.19.3`) |

### 3.4 — Habilitar Swap (recomendado en t2.micro)

Next.js 16 compila dentro de Docker y en una `t2.micro` (1 GB RAM) el build suele quedarse sin memoria (`Killed`, `JavaScript heap out of memory`). Crea **2 GB de swap** antes del primer `docker-compose up --build`:

```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

Deberías ver una línea `Swap` con ~2G disponible.

---

## 4. Desplegar el Proyecto en la EC2

1. Clona el proyecto en tu máquina virtual de AWS:
   ```bash
   git clone <URL_DEL_REPOSITORIO> gestor_lab_frontend
   cd gestor_lab_frontend
   ```

2. **Verifica que existen** `Dockerfile` y `docker-compose.yml` en la raíz:
   ```bash
   ls -la Dockerfile docker-compose.yml package-lock.json
   ```
   Si `Dockerfile` está vacío o no existe, créalo copiando el contenido de la [sección 1](#-dockerfile) de esta guía.

3. **Configura la URL del backend** en `docker-compose.yml`:
   ```bash
   nano docker-compose.yml
   ```
   Asegúrate de que la línea quede así (reemplaza la IP si tu backend usa otra):

   ```yaml
   - NEXT_PUBLIC_API_URL=http://18.221.224.13/api
   ```

   **Checklist de la URL:**
   - Usa la **IP pública** del servidor backend (no `localhost`).
   - **No incluyas** `:8000` (el backend en AWS responde en el puerto 80).
   - **Termina en** `/api`.

   Guarda con `Ctrl+O`, Enter, y sal con `Ctrl+X`.

4. **Confirma Buildx y swap** antes de compilar:
   ```bash
   docker buildx version   # debe ser >= 0.17.0
   free -h                 # debe mostrar Swap activo (sección 3.4)
   ```

5. Levanta y compila el contenedor en segundo plano (puede tardar **5–15 min** en t2.micro):
   ```bash
   docker-compose up -d --build
   ```

6. Verifica que el contenedor está activo:
   ```bash
   docker-compose ps
   docker-compose logs --tail=50 frontend
   ```

¡Todo listo! Tu página web de Next.js está en línea en `http://IP_PUBLICA_FRONTEND`.

**Verificar que el frontend alcanza al backend** (desde tu PC o desde la EC2 del frontend):

```bash
curl -X POST http://18.221.224.13/api/usuarios/login/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin12345\"}"
```

Si recibes JSON con tokens, el backend responde correctamente. Si no hay respuesta en `:8000` pero sí en la URL sin puerto, confirma que `NEXT_PUBLIC_API_URL` no lleva `:8000`.

---

## ⚠️ Solución de problemas

### `compose build requires buildx 0.17.0 or later`

**Qué significa:** Docker Compose no puede compilar la imagen del frontend porque Buildx es viejo o falta.

**Causa habitual en Amazon Linux 2023:**
- `sudo dnf install docker-buildx-plugin` → falla con `No match for argument`
- `docker buildx version` → muestra `0.12.1`

**Solución** (en la EC2 del frontend):

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -L "https://github.com/docker/buildx/releases/download/v0.19.3/buildx-v0.19.3.linux-amd64" \
  -o /usr/local/lib/docker/cli-plugins/docker-buildx
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx
export DOCKER_CLI_PLUGIN_EXTRA_DIRS=/usr/local/lib/docker/cli-plugins
echo 'export DOCKER_CLI_PLUGIN_EXTRA_DIRS=/usr/local/lib/docker/cli-plugins' >> ~/.bashrc
docker buildx version
sudo systemctl restart docker
cd ~/gestor_lab_frontend
docker-compose up -d --build
```

**Plan B** (si Compose sigue fallando):

```bash
cd ~/gestor_lab_frontend
docker build --build-arg NEXT_PUBLIC_API_URL=http://18.221.224.13/api -t gestorlab_frontend .
docker-compose up -d
```

### `the attribute version is obsolete`

Solo es una **advertencia**. Elimina la línea `version: '3.8'` de `docker-compose.yml` si aparece.

### Build se detiene con `Killed` o `JavaScript heap out of memory`

**Causa:** la `t2.micro` se queda sin RAM durante `npm run build` dentro de Docker.

**Solución:**
1. Habilita swap (sección [3.4](#34--habilitar-swap-recomendado-en-t2micro)).
2. Usa el `Dockerfile` de esta guía con `NODE_OPTIONS="--max-old-space-size=768"`.
3. Reintenta: `docker-compose up -d --build`.

### `npm ERR!` / conflictos de dependencias al compilar

**Causa:** `npm install` sin lockfile o versiones distintas a las del proyecto.

**Solución:**
- Asegúrate de subir `package-lock.json` al repositorio.
- En el `Dockerfile` usa `npm ci` (no `npm install`).
- No ejecutes `npm update` en el servidor; los cambios de paquetes se hacen en tu PC y se suben con `git push`.

### El frontend no conecta / login falla / "Failed to fetch"

**Causa más común:** `NEXT_PUBLIC_API_URL` apunta a `http://IP:8000/api` o a `http://localhost:8000/api` en producción.

**Solución:**

1. En `docker-compose.yml`, usa:
   ```yaml
   - NEXT_PUBLIC_API_URL=http://18.221.224.13/api
   ```
2. Reconstruye (obligatorio; Next.js guarda la URL en el build):
   ```bash
   docker-compose up -d --build
   ```
3. En desarrollo local, crea o corrige `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://18.221.224.13/api
   ```
   y reinicia `npm run dev`.

### Cambié la URL pero el frontend sigue usando la vieja

`NEXT_PUBLIC_*` se define en **tiempo de compilación**. Después de editar `docker-compose.yml` o `.env.local`, debes:

- **Docker:** `docker-compose up -d --build`
- **Local:** detener y volver a ejecutar `npm run dev`

### El backend responde en el móvil pero no en el frontend web

Comprueba que ambos usen la misma base:

| Cliente | Archivo | URL esperada |
|---|---|---|
| Móvil | `gestor_lab_movil/lib/core/constants/api_constants.dart` | `http://18.221.224.13/api` |
| Frontend | `gestor_lab_frontend/src/lib/api-client.ts` | `http://18.221.224.13/api` |

---

## 🛑 Comandos Útiles

### Ver Logs:
```bash
docker-compose logs -f frontend
```

### Detener Servicio:
```bash
docker-compose down
```

### Levantar de nuevo tras hacer cambios en el código:
```bash
# Sincroniza los cambios con Git/SCP y luego compila de nuevo:
docker-compose up -d --build
```

---

## 🔄 Actualizar el Proyecto en Producción (Desplegar Nuevos Cambios)

Cuando modificas código en tu PC y quieres que el frontend en AWS se actualice:

1. **Subes el código a GitHub** desde tu computadora.
2. **Entras al servidor AWS por SSH** y descargas ese código.
3. **Verificas Buildx** (si el build falla).
4. **Reconstruyes el contenedor** (obligatorio: Next.js compila la URL y el código en el build).

> Los pasos **A** son en tu PC. Los pasos **B** son **dentro del servidor AWS** del frontend.

---

### A) En tu PC local

```bash
cd gestor_lab_frontend
git add .
git commit -m "Descripción breve de lo que cambiaste"
git push origin main
```

Espera a que termine el `git push` antes de conectarte al servidor.

---

### B) En el servidor AWS (paso a paso)

#### B.1 — Conectarte por SSH

**Windows (PowerShell):**

```powershell
cd C:\ruta\donde\guardaste\la\clave
ssh -i gestorlab-frontend-key.pem ec2-user@TU_IP_PUBLICA_FRONTEND
```

**Linux/Mac:**

```bash
ssh -i gestorlab-frontend-key.pem ec2-user@TU_IP_PUBLICA_FRONTEND
```

Cuando veas `[ec2-user@ip-...]$`, ya estás dentro del servidor.

#### B.2 — Ir a la carpeta del proyecto

```bash
cd /home/ec2-user/gestor_lab_frontend
pwd
ls
```

Debes ver `Dockerfile`, `docker-compose.yml`, `package.json`, `src/`, etc.

#### B.3 — Descargar código nuevo

```bash
git pull origin main
```

#### B.4 — Revisar URL del backend (si cambió la IP)

```bash
nano docker-compose.yml
```

Debe quedar:

```yaml
- NEXT_PUBLIC_API_URL=http://18.221.224.13/api
```

Sin `:8000`. Con `/api` al final.

#### B.5 — Verificar Buildx antes de compilar

```bash
docker buildx version
```

Debe ser **≥ 0.17.0**. Si muestra `0.12.1`, aplica la [sección 3.2](#32--instalar-docker-buildx-obligatorio-en-amazon-linux-2023).

#### B.6 — Reconstruir y levantar

```bash
docker-compose up -d --build
```

El build puede tardar varios minutos en `t2.micro`. No interrumpas el proceso.

**Verificar:**

```bash
docker-compose ps
docker-compose logs --tail=50 frontend
```

#### B.7 — Comprobar en el navegador

```text
http://TU_IP_PUBLICA_FRONTEND
```

Prueba login con `admin` / `admin12345`.

#### B.8 — Limpiar espacio (opcional)

```bash
docker system prune -f
```

---

### Resumen rápido (solo servidor AWS)

Después de `git push` desde tu PC, conéctate por SSH y ejecuta:

```bash
cd /home/ec2-user/gestor_lab_frontend
git pull origin main
docker buildx version
docker-compose up -d --build
docker-compose ps
docker-compose logs --tail=30 frontend
```

> Si `docker buildx version` muestra menos de `0.17.0`, corrige Buildx primero (sección 3.2).  
> Si el build muere con `Killed`, habilita swap (sección 3.4) y vuelve a intentar.
