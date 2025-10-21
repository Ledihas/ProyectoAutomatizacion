# 🚀 Guía de Inicio Rápido

Sigue estos pasos para tener el sistema funcionando en 15-20 minutos.

---

## Paso 1: Servicios Base (5 min)

```bash
# Clonar e iniciar servicios Docker
git clone https://github.com/Ledihas/ProyectoAutomatizacion.git
cd ProyectoAutomatizacion
docker-compose up -d

# Verificar que estén corriendo
docker ps
```

Servicios que deben estar activos:
- ✅ n8n (puerto 5678)
- ✅ Redis (puerto 6379)
- ✅ PostgreSQL (puerto 4432)

---

## Paso 2: Instalar Appwrite (5 min)

### Opción A: Docker (Recomendado)

```bash
docker run -d \
  --name=appwrite \
  --restart unless-stopped \
  --network=host \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e _APP_ENV=production \
  appwrite/appwrite:latest
```

### Opción B: Cloud
1. Visita https://cloud.appwrite.io
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto

**Configurar:**
1. Accede a `http://localhost` (local) o tu URL de Appwrite Cloud
2. Crea el proyecto: `automation-whatsapp`
3. Copia el **Project ID**

---

## Paso 3: Configurar Base de Datos (5 min)

En la consola de Appwrite:

### 3.1. Crear Database
- Nombre: `automation-db`
- Database ID: `automation-db`

### 3.2. Crear Usuario Admin
1. Ve a Auth → Users
2. Click "Add User"
3. Email: `zaza@admin.com`
4. Password: `-bsR266./GViaL`
5. Name: `Administrator`

### 3.3. Crear Colecciones

**Usa el script rápido o crea manualmente siguiendo `docs/APPWRITE_SETUP.md`**

Colecciones necesarias:
1. `instances`
2. `groups`
3. `messages`
4. `system_logs`
5. `user_feedback`

---

## Paso 4: Evolution API (3 min)

### Opción A: Docker
```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=B6D711FCDE4D4FD5936544120E713976 \
  atendai/evolution-api
```

### Opción B: Manual
```bash
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api
npm install
npm run build
npm start
```

**Verificar:**
```bash
curl http://localhost:8080
# Debe responder con info de la API
```

---

## Paso 5: Configurar n8n (2 min)

1. Accede a http://localhost:5678
2. Crea tu cuenta
3. Crea un nuevo workflow
4. Agrega un nodo "Webhook"
5. Configura:
   - Method: POST
   - Path: `sendsms`
6. **Guarda y activa el workflow**

**Para el flujo completo, consulta `docs/ENDPOINTS_AND_WEBHOOKS.md`**

---

## Paso 6: Frontend (5 min)

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env con tus valores
nano .env
```

**Configurar `.env`:**
```env
VITE_APPWRITE_ENDPOINT=http://localhost/v1
VITE_APPWRITE_PROJECT_ID=tu-project-id-aqui
VITE_APPWRITE_DATABASE_ID=automation-db
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/sendsms
VITE_EVOLUTION_API_URL=http://localhost:8080
```

**Iniciar:**
```bash
npm run dev
```

Abre: http://localhost:5173

---

## ✅ Verificación Final

### Checklist:
- [ ] n8n responde en http://localhost:5678
- [ ] Evolution API responde en http://localhost:8080
- [ ] Appwrite responde en http://localhost (o cloud URL)
- [ ] Base de datos `automation-db` existe
- [ ] 5 colecciones creadas
- [ ] Usuario `zaza@admin.com` existe
- [ ] Frontend carga en http://localhost:5173
- [ ] Puedes hacer login

---

## 🎮 Primera Prueba

### 1. Crear una Instancia
1. Login con `zaza@admin.com` / `-bsR266./GViaL`
2. Ve a **Instancias**
3. Click "Nueva Instancia"
4. Nombre: `test-1`
5. Escanea el QR con WhatsApp
6. Espera que se conecte

### 2. Enviar Mensaje de Prueba
1. Ve a **Enviar Mensajes**
2. Agrega mensaje: "Hola, esto es una prueba"
3. Agrega tu número: `+5491123456789`
4. Click "Enviar Mensajes"
5. Verifica que llegue el mensaje

### 3. Ver Dashboard
1. Ve al **Panel**
2. Verifica que se muestre:
   - 1 instancia conectada
   - 1 mensaje enviado
   - Evolution API online

---

## 🆘 Solución Rápida de Problemas

### Error: "Cannot connect to Appwrite"
```bash
# Verifica que Appwrite esté corriendo
docker ps | grep appwrite

# Verifica la URL en .env
echo $VITE_APPWRITE_ENDPOINT
```

### Error: "Evolution API not responding"
```bash
# Reinicia Evolution API
docker restart evolution-api

# Verifica logs
docker logs evolution-api
```

### Error: "Webhook not found"
1. Verifica que el workflow de n8n esté **activado**
2. Verifica la URL del webhook en n8n
3. Verifica que la URL en `.env` coincida

### Error: "Cannot login"
1. Verifica que el usuario exista en Appwrite
2. Verifica email y password
3. Revisa la consola del navegador (F12)

---

## 📱 Siguiente Paso

Una vez que todo funcione:

1. **Configurar n8n completamente** (ver `docs/ENDPOINTS_AND_WEBHOOKS.md`)
2. **Agregar más instancias** para multi-cuenta
3. **Unirte a grupos** mediante enlaces
4. **Revisar el panel admin** para ver logs
5. **Leer la documentación completa** en `/docs`

---

## 📚 Documentación Completa

- `README.md` - Guía completa del proyecto
- `docs/APPWRITE_SETUP.md` - Setup detallado de Appwrite
- `docs/ENDPOINTS_AND_WEBHOOKS.md` - Documentación de APIs
- `docs/PROJECT_STRUCTURE.md` - Estructura del código
- `docs/ASSUMPTIONS.md` - Decisiones técnicas
- `IMPLEMENTATION_SUMMARY.md` - Resumen de implementación

---

## 🎯 ¿Necesitas Ayuda?

1. Revisa los logs:
   ```bash
   # n8n
   docker logs n8n

   # Evolution API
   docker logs evolution-api

   # Frontend (en la terminal donde corre npm run dev)
   ```

2. Revisa el panel de administración: `/admin`

3. Consulta la documentación en `/docs`

---

**¡Listo! Tu sistema de automatización de WhatsApp está funcionando 🎉**

Ahora puedes empezar a automatizar tus mensajes de forma profesional y escalable.
