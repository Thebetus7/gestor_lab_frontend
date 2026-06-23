# Despliegue Frontend (Next.js) en AWS - SIN DOCKER (Vanilla)

Esta guía describe cómo desplegar el frontend de **GestorLab** (desarrollado con Next.js) directamente sobre una instancia EC2 de AWS con **Amazon Linux 2023** usando **PM2** como administrador de procesos y **Nginx** como proxy inverso.

---

## 1. Crear el Servidor EC2 (Consola de AWS)

1. **Nombre:** `gestorlab-frontend`
2. **Sistema Operativo (AMI):** **Amazon Linux 2023 AMI** (capa gratuita).
3. **Tipo de Instancia:** `t2.micro` o `t3.micro`.
4. **Par de claves (SSH):** Crea o selecciona una clave `.pem` (ej. `gestorlab-frontend-key.pem`).
5. **Configuración de Red (Security Group):**
   - Permitir tráfico **SSH** desde cualquier lugar (`0.0.0.0/0`) o tu IP.
   - Permitir tráfico **HTTP** (puerto `80`) desde cualquier lugar (`0.0.0.0/0`) (Nginx expondrá la app aquí).
6. **Almacenamiento:** `8 GiB gp3` (por defecto).

---

## 2. Conectarse al Servidor por SSH

Desde tu terminal local (Git Bash):

```bash
# Permisos a la llave pem
chmod 400 gestorlab-frontend-key.pem

# Conectarse
ssh -i gestorlab-frontend-key.pem ec2-user@IP_PUBLICA_FRONTEND
```

---

## 3. Instalar Node.js (v20) y NVM

Utilizaremos Node Version Manager (NVM) para instalar y manejar la versión correcta de Node.js en AWS:

```bash
# Descargar e instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Recargar variables de entorno
source ~/.bashrc

# Instalar Node.js versión 20
nvm install 20

# Verificar versiones
node -v
npm -v
```

---

## 4. Configurar Memoria Swap (CRÍTICO para Instancias Pequeñas)

> [!IMPORTANT]
> El proceso de compilación de Next.js (`next build`) consume una gran cantidad de memoria RAM. En instancias gratuitas como `t2.micro` (que solo tienen 1 GB de RAM), **el compilador fallará y detendrá la máquina** si no configuras una memoria de intercambio (Swap).

Ejecuta los siguientes comandos para agregar 2 GB de memoria de intercambio temporal:

```bash
# Crear un archivo swap vacío de 2 GB
sudo dd if=/dev/zero of=/swapfile bs=128M count=16

# Configurar permisos de seguridad del archivo
sudo chmod 600 /swapfile

# Habilitar el formato Swap
sudo mkswap /swapfile

# Activar el Swap en el sistema
sudo swapon /swapfile

# Configurar el archivo para que se active en cada reinicio
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab

# Verificar que la memoria Swap está activa
free -h
```

---

## 5. Clonar el Proyecto y Descargar Dependencias

1. Clona el repositorio del frontend dentro de `/home/ec2-user/` o transfiere el código mediante Git/SCP.
   ```bash
   git clone <URL_DE_TU_REPOSITORIO> gestor_lab_frontend
   cd gestor_lab_frontend
   ```

2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

---

## 6. Compilar Next.js con el Endpoint del Backend

Durante la fase de construcción de Next.js, se inyectan las variables públicas de entorno. Debemos proveer la URL del backend a través de la variable `NEXT_PUBLIC_API_URL`.

Asegúrate de apuntar a la **IP pública o dominio** donde corre tu servidor de Backend (incluyendo `/api` al final).

```bash
# Compilar la aplicación inyectando la IP pública del backend
NEXT_PUBLIC_API_URL=http://IP_PUBLICA_DEL_BACKEND/api npm run build
```
*(Si configuraste el backend en el puerto 8000 directamente sin Nginx, la URL debería ser `http://IP_PUBLICA_DEL_BACKEND:8000/api`)*.

---

## 7. Ejecutar Next.js en Segundo Plano usando PM2

Para mantener el servidor Node.js corriendo continuamente y que se levante automáticamente si hay fallos o si la máquina se reinicia, usaremos **PM2**.

1. Instala PM2 globalmente:
   ```bash
   npm install -g pm2
   ```

2. Arranca el servidor de producción de Next.js (por defecto escucha en el puerto `3000`):
   ```bash
   pm2 start npm --name "gestorlab-frontend" -- start
   ```

3. Guarda la lista de procesos de PM2 y configúralo para arrancar en el inicio del sistema:
   ```bash
   pm2 startup
   # (Copia y ejecuta el comando sudo que la salida de pm2 startup te muestre en pantalla)
   
   pm2 save
   ```

---

## 8. Configurar Nginx como Proxy Inverso (Puerto 80 -> Puerto 3000)

Expondremos la aplicación al puerto `80` (HTTP) redireccionando las peticiones locales al puerto `3000` donde corre Next.js.

1. Instala Nginx:
   ```bash
   sudo dnf install nginx -y
   ```

2. Abre y edita la configuración de Nginx:
   ```bash
   sudo nano /etc/nginx/nginx.conf
   ```

3. Localiza el bloque `server` y configúralo para realizar el Proxy Pass a PM2:
   ```nginx
   server {
       listen       80;
       listen       [::]:80;
       server_name  _;

       # Proxy hacia el puerto 3000 de Next.js/PM2
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Habilita e inicia Nginx:
   ```bash
   sudo systemctl enable nginx
   sudo systemctl restart nginx
   ```

¡Felicidades! Tu frontend de Next.js ahora está en producción y accesible de manera global en `http://IP_PUBLICA_FRONTEND`.

---

## 🛑 Apagar / Iniciar Servicios para Ahorrar Costos

### Detener los servicios temporalmente:
```bash
sudo systemctl stop nginx
pm2 stop gestorlab-frontend
```

### Detener la máquina EC2 (Recomendado):
Entra a la Consola de AWS -> EC2 -> Instancias -> Selecciona tu instancia -> **Detener instancia**.

*Nota: Al encenderla nuevamente la IP cambiará y deberás recompilar el frontend (`npm run build`) inyectando la nueva IP del backend, si es que esta también cambió.*

---

## 🔄 Actualizar el Proyecto en Producción (Desplegar Nuevos Cambios)

Si realizaste cambios en tu código de Next.js (diseño, funcionalidades, componentes, etc.) localmente y deseas subirlos al servidor AWS:

1. **Subir los cambios a tu repositorio Git (En tu PC local):**
   ```bash
   git add .
   git commit -m "Actualización de frontend"
   git push origin main
   ```

2. **Descargar los cambios en la máquina de AWS (En el Servidor AWS por SSH):**
   Conéctate por SSH al servidor, navega a la carpeta de la app y haz pull:
   ```bash
   cd /home/ec2-user/gestor_lab_frontend
   git pull origin main
   ```

3. **Instalar posibles nuevas dependencias y recompilar (En el Servidor AWS):**
   Instala posibles nuevas dependencias declaradas en el `package.json` y compila de nuevo tu Next.js inyectando la URL pública de producción del backend:
   ```bash
   npm install
   NEXT_PUBLIC_API_URL=http://IP_PUBLICA_DEL_BACKEND/api npm run build
   ```

4. **Reiniciar el servidor de PM2 (En el Servidor AWS):**
   Reinicia el proceso de Next.js en PM2 para recargar los archivos estáticos compilados de producción:
   ```bash
   pm2 restart gestorlab-frontend
   ```
