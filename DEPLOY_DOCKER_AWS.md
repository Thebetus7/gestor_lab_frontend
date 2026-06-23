# Despliegue Frontend (Next.js) en AWS - CON DOCKER

Esta guía describe cómo empaquetar y desplegar el frontend de **GestorLab** (desarrollado con Next.js) en una instancia EC2 de AWS usando **Docker** y **Docker Compose**.

---

## 1. Archivos de Configuración Requeridos en tu Proyecto

Debes crear los siguientes archivos en la raíz de tu proyecto `gestor_lab_frontend/`:

### 📄 `Dockerfile`
Crearemos un archivo Docker de múltiples etapas (*multi-stage build*) para optimizar el tamaño de la imagen final:

```dockerfile
# Etapa 1: Construcción
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Declarar variable de construcción para la URL del backend
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Compilar Next.js en modo producción
RUN npm run build

# Etapa 2: Servidor de Producción
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiar archivos compilados y dependencias necesarias desde la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]
```

### 📄 `docker-compose.yml`
Docker Compose se encargará de inyectar la URL del backend durante la construcción del contenedor y mapeará el puerto `80` (HTTP) de la máquina al puerto `3000` de Next.js.

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      args:
        # Reemplaza por la IP pública o dominio de tu backend de AWS (conservando el /api)
        - NEXT_PUBLIC_API_URL=http://IP_PUBLICA_DEL_BACKEND/api
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

## 3. Instalar Docker y Docker Compose en la EC2

Conéctate por SSH a la máquina de AWS y ejecuta:

```bash
# Actualizar sistema
sudo dnf update -y

# Instalar Docker y Git
sudo dnf install docker git -y

# Habilitar e iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Dar permisos a tu usuario ec2-user
sudo usermod -aG docker ec2-user
```
> [!IMPORTANT]
> Cierra la terminal SSH (`exit`) y vuelve a conectarte para aplicar los permisos de grupo de Docker.

### Instalar Docker Compose:
```bash
# Descargar binario
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Permisos de ejecución
sudo chmod +x /usr/local/bin/docker-compose

# Verificar versión
docker-compose --version
```

---

## 4. Desplegar el Proyecto en la EC2

1. Clona el proyecto en tu máquina virtual de AWS:
   ```bash
   git clone <URL_DEL_REPOSITORIO> gestor_lab_frontend
   cd gestor_lab_frontend
   ```

2. Abre el archivo `docker-compose.yml` para asegurarte de configurar la IP correcta del backend:
   ```bash
   nano docker-compose.yml
   ```
   *(Modifica la línea `- NEXT_PUBLIC_API_URL=...` colocando la IP de producción del backend. Guarda con Ctrl+O y sal con Ctrl+X).*

3. Levanta y compila el contenedor en segundo plano:
   ```bash
   docker-compose up -d --build
   ```

*Nota: Al compilar mediante Docker, el compilador de Next.js corre dentro del contenedor, el cual heredará los recursos virtuales (incluyendo la memoria Swap del sistema operativo anfitrión si se requiere, aunque al no compilarse directamente sobre el sistema de archivos del host, Docker optimiza el uso de CPU. Si se detiene la compilación, puedes habilitar swap en el host de la misma manera que en la guía vanilla).*

¡Todo listo! Tu página web de Next.js está en línea en `http://IP_PUBLICA_FRONTEND`.

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

Con Docker, desplegar modificaciones locales en el frontend es muy sencillo:

1. **Subir los cambios a tu repositorio Git (En tu PC local):**
   ```bash
   git add .
   git commit -m "Actualización de frontend con Docker"
   git push origin main
   ```

2. **Descargar los cambios en la máquina de AWS (En el Servidor AWS por SSH):**
   Conéctate por SSH al servidor, navega a la carpeta de la app y haz pull:
   ```bash
   cd /home/ec2-user/gestor_lab_frontend
   git pull origin main
   ```

3. **Reconstruir y levantar el contenedor (En el Servidor AWS):**
   *(Nota: Si la IP de tu backend cambió al reiniciar el servidor backend, recuerda primero editar el archivo `docker-compose.yml` para colocar la nueva IP en el argumento `NEXT_PUBLIC_API_URL` antes de reconstruir).*
   
   Ejecuta el comando para compilar Next.js dentro del contenedor Docker con los nuevos archivos de código:
   ```bash
   docker-compose up -d --build
   ```

4. **Limpiar imágenes viejas (Opcional):**
   Para que no se acumulen imágenes sin nombre y se sature el disco de la EC2, ejecuta:
   ```bash
   docker system prune -f
   ```
