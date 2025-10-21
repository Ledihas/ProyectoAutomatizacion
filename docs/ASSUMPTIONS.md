# Decisiones Técnicas y Suposiciones

Este documento detalla todas las decisiones técnicas y suposiciones que se tomaron durante el desarrollo del proyecto.

## Decisiones de Arquitectura

### 1. Framework Frontend: Refine.dev

**Decisión**: Usar Refine.dev como framework base

**Razones**:
- Integración nativa con Appwrite
- Componentes pre-construidos para CRUD
- Sistema de autenticación listo para usar
- Soporte para live updates con Appwrite
- Ant Design como biblioteca de UI moderna y completa

**Alternativas consideradas**:
- Next.js con componentes custom
- Create React App básico
- Vue.js con Vuetify

### 2. Base de Datos: Appwrite

**Decisión**: Usar Appwrite como backend principal

**Razones**:
- Backend as a Service completo
- Autenticación integrada
- Realtime subscriptions
- SDKs oficiales para React
- Auto-escalable
- Open source

**Nota**: En el mensaje inicial se mencionó usar Supabase por defecto, pero dado que el proyecto original ya estaba configurado con Appwrite y los requisitos explícitamente mencionan "integrado con Appwrite", se mantuvo Appwrite como la base de datos principal.

### 3. Automatización: n8n

**Decisión**: Usar n8n para workflows de automatización

**Razones**:
- Ya estaba configurado en el proyecto original
- Permite crear workflows visuales
- Integración fácil con webhooks
- Puede manejar lógica compleja sin código
- Soporta delays y reintentos

### 4. WhatsApp API: Evolution API

**Decisión**: Mantener Evolution API como proveedor

**Razones**:
- Ya configurado en docker-compose
- Open source y auto-hospedable
- Soporta múltiples instancias
- API REST completa
- Generación de códigos QR
- Gestión de grupos

## Decisiones de Diseño

### 5. Sidebar con Instancias

**Decisión**: Sidebar fijo a la izquierda con lista de instancias

**Razones**:
- Acceso rápido para cambiar entre instancias
- Estado visual inmediato de cada instancia
- No requiere navegación adicional
- Colapsa para ganar espacio en pantalla

**Alternativas consideradas**:
- Dropdown en el header
- Tabs en la parte superior
- Modal selector

### 6. Estructura de Colecciones en Appwrite

**Decisión**: 5 colecciones principales (instances, groups, messages, system_logs, user_feedback)

**Razones**:
- Separación clara de responsabilidades
- Facilita queries específicos
- Permisos granulares por colección
- Escalabilidad

**Consideraciones**:
- Los mensajes no se eliminan automáticamente (para auditoría)
- Los logs del sistema se mantienen indefinidamente (considerar rotación en producción)

### 7. Autenticación

**Decisión**: Email/password con Appwrite Auth

**Razones**:
- Simple de implementar
- No requiere configuración externa
- Usuario admin pre-definido
- Sesiones gestionadas automáticamente

**Usuario Admin Predefinido**:
- Email: zaza@admin.com
- Password: -bsR266./GViaL (como se especificó en los requisitos)

### 8. Manejo de Errores

**Decisión**: Sistema de 3 capas

1. **Notificaciones en UI**: Para feedback inmediato al usuario
2. **Logs en Base de Datos**: Para auditoría y debugging
3. **Reintentos Automáticos**: Después de 5 minutos

**Razones**:
- El usuario siempre sabe qué está pasando
- Los admins pueden revisar errores históricos
- Reduce falsos negativos por problemas temporales

### 9. Control de Intervalos entre Mensajes

**Decisión**: Intervalos aleatorios configurables (min-max)

**Razones**:
- Evita patrones detectables por WhatsApp
- Reduce riesgo de bloqueo
- Flexibilidad según caso de uso
- Se implementa en n8n, no en el frontend

### 10. Mensajes Aleatorios

**Decisión**: El usuario puede agregar múltiples mensajes y se elige uno al azar

**Razones**:
- Evita mensajes idénticos masivos
- Parece más natural/humano
- Reduce detección de bots
- Fácil de implementar

## Suposiciones Técnicas

### 11. Evolution API ya está instalada

**Suposición**: El usuario instalará Evolution API por separado

**Razón**: Evolution API no está incluida en el docker-compose y requiere configuración específica según el entorno (local, VPS, cloud)

**Documentación**: Se incluye en el README cómo configurarla

### 12. n8n Workflow Manual

**Suposición**: El usuario creará el workflow de n8n manualmente

**Razón**: Los workflows de n8n son complejos y específicos para cada caso de uso. Se proporciona la estructura base en la documentación.

**Alternativa futura**: Exportar un workflow JSON pre-configurado

### 13. Códigos QR caducan rápido

**Suposición**: Los códigos QR de WhatsApp caducan en ~60 segundos

**Implementación**: Se incluye botón de "Actualizar QR" en el modal

### 14. Grupos se guardan al unirse

**Suposición**: Cuando el webhook de n8n une a un grupo, devuelve información básica del grupo

**Implementación**: Se guarda en la colección `groups` con información mínima. El nombre del grupo puede actualizarse posteriormente con una llamada a Evolution API.

### 15. Un Usuario = Múltiples Instancias

**Modelo de datos**:
- Cada usuario puede tener N instancias
- Cada instancia pertenece a 1 usuario
- Los grupos e instancias están vinculados

**Razón**: Permite gestión multi-cuenta para empresas o usuarios avanzados

### 16. La última instancia conectada es la predeterminada

**Decisión**: Al cargar la app, se selecciona automáticamente la última instancia con estado "connected"

**Razón**: Mejor UX - el usuario probablemente quiere usar su instancia activa

### 17. Panel Admin sin 2FA

**Suposición**: Para desarrollo/demo, el panel admin solo requiere email/password

**Recomendación para producción**: Agregar 2FA, whitelist de IPs, o tokens de acceso

### 18. Reintentos de 5 minutos

**Decisión arbitraria**: Esperar 5 minutos antes de reintentar un envío fallido

**Razón**: Balance entre dar tiempo para resolver el problema y no esperar demasiado

**Implementación futura**: Podría ser configurable por usuario

### 19. Sin límite de mensajes por envío

**Suposición**: El usuario es responsable de no enviar spam

**Recomendación**: En producción, agregar límites (ej: máximo 100 destinatarios por envío, máximo 10 envíos por hora)

### 20. TypeScript Strict Mode

**Decisión**: Usar TypeScript con configuración strict

**Razones**:
- Catch errores en tiempo de desarrollo
- Mejor autocompletado
- Código más mantenible
- Documentación implícita vía tipos

## Limitaciones Conocidas

### 21. Sin soporte para archivos multimedia

**Limitación**: La versión actual solo soporta texto

**Razón**: Simplificar el MVP. Agregar soporte para imágenes requiere:
- Upload a storage (Appwrite Storage)
- Manejo de URLs en n8n
- Validación de tipos de archivo

**Roadmap**: Próxima versión

### 22. Sin programación de mensajes

**Limitación**: No se pueden programar mensajes para envío futuro

**Implementación futura**: Agregar un campo `scheduledFor` y un cron job en n8n

### 23. Sin estadísticas avanzadas

**Limitación**: Las métricas son básicas (total mensajes, grupos, etc.)

**Mejoras futuras**:
- Tasa de entrega
- Tasa de respuesta
- Horarios óptimos de envío
- Gráficos históricos

### 24. UI no totalmente responsive

**Nota**: Aunque se usa Ant Design (que es responsive), algunas vistas complejas pueden no verse perfectas en móviles muy pequeños

**Prioridad**: Desktop first, dado que es una herramienta de automatización

## Configuración de Producción

### 25. Variables de Entorno

Para producción, actualizar:

```env
VITE_APPWRITE_ENDPOINT=https://tu-dominio.com/v1
VITE_APPWRITE_PROJECT_ID=tu-project-id-prod
VITE_N8N_WEBHOOK_URL=https://n8n.tu-dominio.com/webhook/sendsms
VITE_EVOLUTION_API_URL=https://evolution.tu-dominio.com
```

### 26. HTTPS Obligatorio

**Recomendación**: Usar HTTPS en producción para:
- Appwrite
- n8n webhooks
- Evolution API
- Frontend

### 27. Rate Limiting

**Recomendación**: Implementar rate limiting en:
- Webhooks de n8n
- Evolution API
- Endpoints de Appwrite (via Functions)

### 28. Backups Automáticos

**Recomendación**: Configurar backups diarios de:
- Base de datos Appwrite
- Configuraciones de n8n
- Instancias de Evolution API

## Consideraciones de Seguridad

### 29. API Keys Hardcodeadas

**Advertencia**: La API key de Evolution API está hardcodeada en el código por simplicidad

**Para producción**: Mover a variables de entorno del servidor, no del cliente

### 30. Permisos de Appwrite

**Configuración actual**: `user:*` permite a cualquier usuario autenticado acceder a sus propios datos

**Para producción**: Revisar y ajustar permisos granulares, especialmente para:
- system_logs (solo admins)
- user_feedback (solo admins pueden leer)

### 31. Validación de Inputs

**Actual**: Validación básica en el frontend

**Recomendación**: Agregar validación en el backend (Appwrite Functions) para:
- Números de teléfono válidos
- URLs de grupos válidas
- Longitud de mensajes

## Notas Finales

Este documento debe actualizarse cada vez que se tome una decisión técnica importante. Todas las decisiones están abiertas a revisión y mejora basándose en feedback y casos de uso reales.

**Última actualización**: 2025-10-21
