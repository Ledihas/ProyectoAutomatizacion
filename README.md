# WhatsApp Automation System

Sistema completo para automatizar el envío de mensajes por WhatsApp utilizando Evolution API, n8n y Appwrite.

## Características Principales

- **Multi-instancias**: Gestiona múltiples conexiones de WhatsApp simultáneamente
- **Envío automático de mensajes**: Envía mensajes a números individuales o grupos
- **Gestión de grupos**: Une automáticamente a grupos mediante enlaces de invitación
- **Control de tiempo**: Configura intervalos entre mensajes para evitar bloqueos
- **Dashboard en tiempo real**: Visualiza métricas y estadísticas actualizadas
- **Panel de administración**: Acceso completo a logs, errores y gestión de usuarios
- **Manejo de errores**: Sistema automático de reintentos y notificaciones

## Stack Tecnológico

- **Frontend**: React + TypeScript + Vite + Refine.dev + Ant Design
- **Backend**: Appwrite (Base de datos, autenticación, tiempo real)
- **Automatización**: n8n (Workflows y webhooks)
- **WhatsApp API**: Evolution API
- **Infraestructura**: Docker Compose

## Requisitos Previos

- Docker y Docker Compose instalados
- Node.js 18+ y npm
- Puertos disponibles: 5173 (frontend), 5678 (n8n), 8080 (Evolution API), 80/443 (Appwrite)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Ledihas/ProyectoAutomatizacion.git
cd ProyectoAutomatizacion
```

### 2. Configurar servicios con Docker

```bash
docker-compose up -d
```

Esto iniciará:
- n8n (http://localhost:5678)
- Redis
- PostgreSQL
- MongoDB (si es necesario para Evolution API)

### 3. Instalar Evolution API

Sigue la documentación oficial de Evolution API para instalarla localmente o en un servidor:
https://doc.evolution-api.com/

Asegúrate de que esté corriendo en el puerto 8080 y configura la API Key en el archivo `.env`:

```env
AUTHENTICATION_API_KEY=B6D711FCDE4D4FD5936544120E713976
```

### 4. Configurar Appwrite

Instala Appwrite siguiendo su documentación oficial:
https://appwrite.io/docs/installation

Luego, configura las colecciones necesarias siguiendo la guía en:
`docs/APPWRITE_SETUP.md`

### 5. Configurar el Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edita el archivo `.env` con tus valores:

```env
VITE_APPWRITE_ENDPOINT=http://localhost/v1
VITE_APPWRITE_PROJECT_ID=automation-whatsapp
VITE_APPWRITE_DATABASE_ID=automation-db
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/sendsms
VITE_EVOLUTION_API_URL=http://localhost:8080
```

### 6. Iniciar el Frontend

```bash
npm run dev
```

El frontend estará disponible en: http://localhost:5173

## Configuración de n8n

1. Accede a n8n: http://localhost:5678
2. Crea un nuevo workflow
3. Agrega un nodo "Webhook" con la ruta `/webhook/sendsms`
4. Configura el flujo para:
   - Recibir payload con: `instance`, `messages`, `targets`, `isGroup`, `delayMin`, `delayMax`
   - Si `isGroupInvites=true`, unirse a grupos
   - Si no, enviar mensajes con intervalos aleatorios
   - Usar Evolution API para enviar los mensajes
5. Activa el workflow

Ejemplo básico de payload para el webhook:

```json
{
  "instance": "mi-whatsapp",
  "messages": ["Hola, ¿cómo estás?", "¿Todo bien?"],
  "targets": ["+1234567890", "+0987654321"],
  "isGroup": false,
  "delayMin": 5,
  "delayMax": 10
}
```

## Uso del Sistema

### Crear una Instancia

1. Ve a **Instancias** en el menú
2. Haz clic en "Nueva Instancia"
3. Ingresa un nombre (ej: `mi-whatsapp-1`)
4. Escanea el código QR con WhatsApp
5. La instancia se conectará automáticamente

### Enviar Mensajes

1. Ve a **Enviar Mensajes**
2. Selecciona la instancia en el sidebar
3. Agrega uno o más mensajes (se elegirá uno al azar)
4. Agrega los números o códigos de grupo destino
5. Configura el intervalo entre envíos
6. Haz clic en "Enviar Mensajes"

### Unirse a Grupos

1. Ve a **Grupos**
2. Agrega enlaces de invitación de WhatsApp
3. Haz clic en "Unirse a Grupos"
4. Los grupos se guardarán automáticamente

### Panel de Administración

**Credenciales:**
- Email: `zaza@admin.com`
- Password: `-bsR266./GViaL`

El panel de administración permite:
- Ver logs del sistema
- Ver errores registrados
- Gestionar sesiones activas
- Revisar feedback de usuarios
- Acceder a la base de datos (excepto contraseñas)

## Estructura del Proyecto

```
.
├── frontend/                # Aplicación React + Refine
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── providers/      # Configuración de Appwrite
│   │   ├── services/       # Servicios (n8n, Evolution API)
│   │   ├── hooks/          # React hooks personalizados
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utilidades
│   └── package.json
├── docs/                    # Documentación
│   ├── APPWRITE_SETUP.md
│   ├── ENDPOINTS_AND_WEBHOOKS.md
│   ├── PROJECT_STRUCTURE.md
│   └── ASSUMPTIONS.md
├── docker-compose.yml       # Servicios Docker
├── env.txt                  # Variables de entorno de ejemplo
└── README.md
```

## Endpoints y Webhooks

### n8n Webhook Principal

**URL**: `http://localhost:5678/webhook/sendsms`

**Método**: POST

**Payload para enviar mensajes**:
```json
{
  "instance": "nombre-instancia",
  "messages": ["mensaje1", "mensaje2"],
  "targets": ["+1234567890"],
  "isGroup": false,
  "delayMin": 5,
  "delayMax": 10
}
```

**Payload para unirse a grupos**:
```json
{
  "instance": "nombre-instancia",
  "inviteCodes": ["https://chat.whatsapp.com/ABC123"],
  "isGroupInvites": true
}
```

### Evolution API Endpoints

Consulta la documentación completa en: `docs/ENDPOINTS_AND_WEBHOOKS.md`

## Solución de Problemas

### La instancia no se conecta

- Verifica que Evolution API esté corriendo
- Verifica que el código QR esté actualizado (caduca después de 60 segundos)
- Intenta eliminar y recrear la instancia

### Los mensajes no se envían

- Verifica que n8n esté corriendo y el workflow esté activado
- Verifica que la instancia esté conectada
- Revisa los logs del sistema en el panel de administración

### Error de conexión a Appwrite

- Verifica que Appwrite esté corriendo
- Verifica las variables de entorno en `.env`
- Verifica que las colecciones estén creadas correctamente

## Manejo de Errores

El sistema incluye:

- **Reintentos automáticos**: Los mensajes fallidos se reintentarán después de 5 minutos
- **Logs del sistema**: Todos los errores se registran en la base de datos
- **Notificaciones**: Los usuarios reciben notificaciones cuando algo falla
- **Panel admin**: Los administradores pueden ver todos los errores en tiempo real

## Seguridad

- Todas las contraseñas se almacenan cifradas en Appwrite
- Las API keys no se exponen en el cliente
- Los permisos de base de datos están configurados por usuario
- El panel de administración requiere credenciales específicas

## Desarrollo

### Compilar el proyecto

```bash
cd frontend
npm run build
```

### Ejecutar tests

```bash
npm run test
```

### Linter

```bash
npm run lint
```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## Soporte

Para preguntas o problemas:
- Abre un issue en GitHub
- Consulta la documentación en `/docs`
- Revisa el panel de administración para logs de errores

## Roadmap

- [ ] Soporte para envío de imágenes y archivos
- [ ] Programación de mensajes
- [ ] Plantillas de mensajes
- [ ] Estadísticas avanzadas
- [ ] Integración con más servicios
- [ ] API REST pública
- [ ] Dark mode completo
- [ ] Aplicación móvil

---

**Desarrollado con ❤️ para automatizar WhatsApp de forma segura y eficiente**
