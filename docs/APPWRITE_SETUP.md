# Configuración de Appwrite

Este documento describe cómo configurar Appwrite para este proyecto.

## Requisitos Previos

- Appwrite instalado y corriendo (puede ser local o en la nube)
- Acceso a la consola de Appwrite

## Configuración del Proyecto

1. **Crear un nuevo proyecto en Appwrite**
   - Nombre: `automation-whatsapp` (o el que prefieras)
   - Copia el Project ID y actualízalo en `.env`

2. **Crear la base de datos**
   - Nombre: `automation-db`
   - Database ID: `automation-db`

## Colecciones a Crear

### 1. instances

Almacena las instancias de WhatsApp conectadas.

**Atributos:**

| Nombre | Tipo | Tamaño | Requerido | Array | Default |
|--------|------|--------|-----------|-------|---------|
| name | string | 255 | Sí | No | - |
| status | string | 50 | Sí | No | disconnected |
| qrCode | string | 10000 | No | No | - |
| phoneNumber | string | 50 | No | No | - |
| userId | string | 255 | Sí | No | - |
| createdAt | datetime | - | Sí | No | - |
| updatedAt | datetime | - | Sí | No | - |
| lastConnectedAt | datetime | - | No | No | - |

**Índices:**
- `userId` (ascendente)
- `status` (ascendente)

**Permisos:**
- Read: `user:*`
- Create: `user:*`
- Update: `user:*`
- Delete: `user:*`

---

### 2. groups

Almacena los grupos de WhatsApp.

**Atributos:**

| Nombre | Tipo | Tamaño | Requerido | Array | Default |
|--------|------|--------|-----------|-------|---------|
| groupId | string | 255 | Sí | No | - |
| name | string | 255 | Sí | No | - |
| inviteCode | string | 500 | Sí | No | - |
| isMember | boolean | - | Sí | No | false |
| instanceId | string | 255 | Sí | No | - |
| userId | string | 255 | Sí | No | - |
| joinedAt | datetime | - | No | No | - |
| createdAt | datetime | - | Sí | No | - |

**Índices:**
- `instanceId` (ascendente)
- `userId` (ascendente)
- `isMember` (ascendente)

**Permisos:**
- Read: `user:*`
- Create: `user:*`
- Update: `user:*`
- Delete: `user:*`

---

### 3. messages

Almacena el historial de mensajes enviados.

**Atributos:**

| Nombre | Tipo | Tamaño | Requerido | Array | Default |
|--------|------|--------|-----------|-------|---------|
| text | string | 5000 | Sí | No | - |
| target | string | 255 | Sí | No | - |
| isGroup | boolean | - | Sí | No | false |
| instanceId | string | 255 | Sí | No | - |
| userId | string | 255 | Sí | No | - |
| status | string | 50 | Sí | No | pending |
| sentAt | datetime | - | No | No | - |
| createdAt | datetime | - | Sí | No | - |
| error | string | 1000 | No | No | - |

**Índices:**
- `instanceId` (ascendente)
- `userId` (ascendente)
- `status` (ascendente)
- `createdAt` (descendente)

**Permisos:**
- Read: `user:*`
- Create: `user:*`
- Update: `user:*`
- Delete: `user:*`

---

### 4. system_logs

Almacena logs del sistema para el panel de administración.

**Atributos:**

| Nombre | Tipo | Tamaño | Requerido | Array | Default |
|--------|------|--------|-----------|-------|---------|
| type | string | 50 | Sí | No | info |
| message | string | 1000 | Sí | No | - |
| details | string | 5000 | No | No | - |
| userId | string | 255 | No | No | - |
| instanceId | string | 255 | No | No | - |
| createdAt | datetime | - | Sí | No | - |

**Índices:**
- `type` (ascendente)
- `createdAt` (descendente)
- `userId` (ascendente)

**Permisos:**
- Read: Solo para admins o mediante API
- Create: `user:*`
- Update: Solo admins
- Delete: Solo admins

---

### 5. user_feedback

Almacena feedback de usuarios.

**Atributos:**

| Nombre | Tipo | Tamaño | Requerido | Array | Default |
|--------|------|--------|-----------|-------|---------|
| userId | string | 255 | Sí | No | - |
| message | string | 5000 | Sí | No | - |
| type | string | 50 | Sí | No | other |
| status | string | 50 | Sí | No | new |
| createdAt | datetime | - | Sí | No | - |

**Índices:**
- `userId` (ascendente)
- `status` (ascendente)
- `createdAt` (descendente)

**Permisos:**
- Read: Solo admins
- Create: `user:*`
- Update: Solo admins
- Delete: Solo admins

---

## Configuración de Autenticación

1. **Habilitar Email/Password Authentication**
   - Ve a Auth > Settings
   - Habilita "Email/Password"
   - Desactiva la verificación de email (opcional para desarrollo)

2. **Crear usuario administrador**
   - Email: `zaza@admin.com`
   - Password: `-bsR266./GViaL`
   - Name: `Administrator Zaza`

## Variables de Entorno

Actualiza el archivo `.env` del frontend con los valores correspondientes:

```env
VITE_APPWRITE_ENDPOINT=http://localhost/v1
VITE_APPWRITE_PROJECT_ID=tu-project-id
VITE_APPWRITE_DATABASE_ID=automation-db
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/sendsms
VITE_EVOLUTION_API_URL=http://localhost:8080
```

## Verificación

Después de crear todas las colecciones:

1. Verifica que todas las colecciones estén creadas correctamente
2. Verifica que los permisos estén configurados
3. Prueba crear un usuario y autenticarte
4. Verifica que el usuario admin pueda acceder

## Notas Importantes

- Los timestamps se almacenan en formato ISO 8601
- Todos los IDs de colección deben coincidir con los definidos en `src/providers/appwrite.ts`
- Los permisos `user:*` permiten a cualquier usuario autenticado acceder a sus propios datos
- Para producción, considera ajustar los permisos para mayor seguridad
