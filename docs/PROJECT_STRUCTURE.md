# Estructura del Proyecto

Este documento describe la organización de carpetas y archivos del proyecto.

## Árbol de Directorios

```
ProyectoAutomatizacion/
├── frontend/                          # Aplicación React + TypeScript
│   ├── src/
│   │   ├── components/               # Componentes reutilizables
│   │   │   └── InstanceSidebar.tsx  # Sidebar de instancias
│   │   │
│   │   ├── pages/                   # Páginas/vistas principales
│   │   │   ├── Dashboard.tsx        # Panel principal con métricas
│   │   │   ├── SendMessages.tsx     # Envío de mensajes
│   │   │   ├── Groups.tsx           # Gestión de grupos
│   │   │   ├── Instances.tsx        # Gestión de instancias
│   │   │   ├── Admin.tsx            # Panel de administración
│   │   │   └── Login.tsx            # Página de login
│   │   │
│   │   ├── providers/               # Configuración de servicios
│   │   │   └── appwrite.ts          # Cliente y config de Appwrite
│   │   │
│   │   ├── services/                # Servicios externos
│   │   │   ├── n8n.service.ts       # Cliente para webhooks n8n
│   │   │   └── evolution.service.ts # Cliente para Evolution API
│   │   │
│   │   ├── hooks/                   # React hooks personalizados
│   │   │   └── useInstances.ts      # Hook para gestión de instancias
│   │   │
│   │   ├── types/                   # Definiciones TypeScript
│   │   │   └── index.ts             # Tipos e interfaces
│   │   │
│   │   ├── utils/                   # Utilidades (futuro)
│   │   │
│   │   ├── App.tsx                  # Componente principal
│   │   └── main.tsx                 # Entry point
│   │
│   ├── index.html                    # HTML base
│   ├── package.json                  # Dependencias y scripts
│   ├── tsconfig.json                 # Configuración TypeScript
│   ├── vite.config.ts                # Configuración Vite
│   ├── .env                          # Variables de entorno (local)
│   └── .env.example                  # Ejemplo de variables
│
├── docs/                              # Documentación
│   ├── APPWRITE_SETUP.md             # Guía setup Appwrite
│   ├── ENDPOINTS_AND_WEBHOOKS.md     # API y webhooks
│   ├── PROJECT_STRUCTURE.md          # Este archivo
│   └── ASSUMPTIONS.md                # Decisiones técnicas
│
├── docker-compose.yml                 # Servicios Docker
├── env.txt                            # Variables ejemplo
└── README.md                          # Documentación principal
```

## Descripción de Carpetas

### `/frontend`

Contiene toda la aplicación web construida con React y TypeScript.

#### `/frontend/src/components`

Componentes React reutilizables:

- **InstanceSidebar.tsx**: Sidebar lateral que muestra todas las instancias de WhatsApp con su estado. Permite cambiar entre instancias y crear nuevas.

#### `/frontend/src/pages`

Páginas principales de la aplicación (cada una es una ruta):

- **Dashboard.tsx**: Vista principal con métricas, últimos mensajes enviados y grupos recientes
- **SendMessages.tsx**: Formulario para enviar mensajes a números o grupos
- **Groups.tsx**: Listado de grupos y opción para unirse a nuevos
- **Instances.tsx**: CRUD de instancias (crear, ver QR, eliminar)
- **Admin.tsx**: Panel de administración (logs, errores, sesiones)
- **Login.tsx**: Página de autenticación

#### `/frontend/src/providers`

Configuración de servicios externos:

- **appwrite.ts**: Cliente de Appwrite, IDs de base de datos y colecciones

#### `/frontend/src/services`

Clientes para APIs externas:

- **n8n.service.ts**: Funciones para llamar al webhook de n8n
  - `sendMessages()`: Enviar mensajes
  - `joinGroups()`: Unirse a grupos

- **evolution.service.ts**: Funciones para Evolution API
  - `checkStatus()`: Verificar si la API está online
  - `createInstance()`: Crear nueva instancia
  - `getInstanceQR()`: Obtener código QR
  - `getInstanceStatus()`: Estado de conexión
  - `deleteInstance()`: Eliminar instancia
  - `fetchGroupInfo()`: Info de un grupo

#### `/frontend/src/hooks`

React hooks personalizados:

- **useInstances.ts**: Hook para gestionar instancias
  - Lista de instancias
  - Instancia seleccionada
  - Funciones CRUD

#### `/frontend/src/types`

Definiciones TypeScript compartidas:

- `Instance`: Modelo de instancia de WhatsApp
- `Group`: Modelo de grupo
- `Message`: Modelo de mensaje
- `SystemLog`: Log del sistema
- `UserFeedback`: Feedback de usuarios
- `SendMessagePayload`: Payload para webhook
- `JoinGroupPayload`: Payload para unirse a grupos
- `DashboardStats`: Estadísticas del dashboard

### `/docs`

Documentación técnica del proyecto:

- **APPWRITE_SETUP.md**: Guía paso a paso para configurar Appwrite (colecciones, atributos, permisos)
- **ENDPOINTS_AND_WEBHOOKS.md**: Documentación de todos los endpoints de Evolution API y webhooks de n8n
- **PROJECT_STRUCTURE.md**: Este archivo (estructura del proyecto)
- **ASSUMPTIONS.md**: Decisiones técnicas y suposiciones tomadas durante el desarrollo

### Archivos Raíz

- **docker-compose.yml**: Define servicios Docker (n8n, Redis, PostgreSQL)
- **env.txt**: Variables de entorno de ejemplo para Evolution API
- **README.md**: Documentación principal del proyecto

## Flujo de Datos

### 1. Autenticación

```
User → Login.tsx → Appwrite Auth → App.tsx → Dashboard
```

### 2. Crear Instancia

```
User → Instances.tsx → evolution.service.ts → Evolution API
                    → Appwrite (guardar en DB)
```

### 3. Enviar Mensajes

```
User → SendMessages.tsx → n8n.service.ts → n8n Webhook
                                         → Evolution API
                       → Appwrite (guardar mensaje)
```

### 4. Unirse a Grupo

```
User → Groups.tsx → n8n.service.ts → n8n Webhook
                                   → Evolution API (join)
                 → Appwrite (guardar grupo)
```

### 5. Dashboard en Tiempo Real

```
Appwrite Realtime → useList() hook → Dashboard.tsx → Actualización UI
```

## Patrones de Diseño

### Separation of Concerns

- **Páginas**: Solo lógica de presentación y estado local
- **Services**: Toda la comunicación con APIs externas
- **Hooks**: Lógica reutilizable de React
- **Types**: Contratos de datos compartidos

### Data Fetching

Se usa Refine's `useList()`, `useCreate()`, `useUpdate()`, `useDelete()` para:
- Gestión automática de loading states
- Caching de datos
- Refetch automático
- Optimistic updates

### Error Handling

Tres capas:
1. **Try/Catch en Services**: Captura errores de red
2. **Notifications en UI**: Feedback al usuario
3. **Logs en Appwrite**: Para debugging y admin panel

### State Management

- **Global**: Refine + Appwrite (instancias, grupos, mensajes)
- **Local**: useState para UI temporal (modals, forms)
- **URL State**: React Router para navegación

## Convenciones de Código

### Nombres de Archivos

- Componentes: `PascalCase.tsx` (ej: `InstanceSidebar.tsx`)
- Services: `camelCase.service.ts` (ej: `n8n.service.ts`)
- Hooks: `use + PascalCase.ts` (ej: `useInstances.ts`)
- Types: `index.ts` o `types.ts`

### Imports

Orden de imports:
1. React y librerías externas
2. Refine hooks y componentes
3. Ant Design componentes
4. Providers y servicios locales
5. Types
6. Estilos

Ejemplo:
```typescript
import React from 'react';
import { useList, useCreate } from '@refinedev/core';
import { Card, Button } from 'antd';
import { n8nService } from '../services/n8n.service';
import { Instance } from '../types';
```

### Componentes

- Usar functional components con TypeScript
- Definir Props interface cuando sea necesario
- Exportar como named export o default export según contexto

```typescript
interface MyComponentProps {
  title: string;
  onSubmit: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onSubmit }) => {
  return <div>...</div>;
};
```

### Async/Await

Siempre usar try/catch para operaciones asíncronas:

```typescript
const handleSubmit = async () => {
  try {
    const result = await someAsyncFunction();
    // success
  } catch (error) {
    // handle error
  }
};
```

## Extensibilidad

### Agregar una Nueva Página

1. Crear archivo en `/frontend/src/pages/MiPagina.tsx`
2. Agregar ruta en `/frontend/src/App.tsx`
3. Agregar al array `resources` en Refine
4. (Opcional) Crear colección en Appwrite si necesita datos

### Agregar un Nuevo Servicio

1. Crear archivo en `/frontend/src/services/miServicio.service.ts`
2. Exportar funciones con tipos bien definidos
3. Manejar errores apropiadamente
4. Documentar en `ENDPOINTS_AND_WEBHOOKS.md`

### Agregar un Nuevo Hook

1. Crear archivo en `/frontend/src/hooks/useMiHook.ts`
2. Usar hooks de Refine cuando sea posible
3. Retornar objetos con nombres descriptivos
4. Documentar parámetros y retorno

## Testing (Futuro)

Estructura sugerida:

```
frontend/
├── src/
│   ├── components/
│   │   ├── InstanceSidebar.tsx
│   │   └── __tests__/
│   │       └── InstanceSidebar.test.tsx
│   ├── services/
│   │   ├── n8n.service.ts
│   │   └── __tests__/
│   │       └── n8n.service.test.ts
```

## Build y Deploy

### Desarrollo

```bash
cd frontend
npm run dev
```

### Producción

```bash
cd frontend
npm run build
# Output en /frontend/dist
```

### Variables de Entorno

**Desarrollo**: Usar `.env`

**Producción**: Configurar en el servidor/hosting:
- Vercel: Dashboard → Settings → Environment Variables
- Netlify: Site settings → Build & deploy → Environment
- Docker: docker-compose.yml → environment

## Notas Importantes

1. **No commitear `.env`**: Usar `.env.example` para documentar variables necesarias
2. **TypeScript strict**: Todo debe tener tipos explícitos
3. **Components pequeños**: Si un componente supera 300 líneas, considerar dividirlo
4. **Documentar decisiones**: Actualizar `ASSUMPTIONS.md` con cambios importantes

---

**Última actualización**: 2025-10-21
