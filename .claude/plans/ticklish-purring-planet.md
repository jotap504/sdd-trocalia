# Sistema de Mensajería Bidireccional

## Contexto

Actualmente, cuando un comprador envía una consulta al vendedor desde la página de detalle de una publicación, el mensaje se guarda en `contact_inquiries` pero no llega a ninguna parte: el vendedor no recibe notificación y no hay forma de responder dentro de la plataforma. El formulario pide nombre y email (ya solucionado) pero no hay un historial de conversaciones ni un apartado de mensajes.

Se necesita:
1. Que el vendedor reciba una notificación in-app cuando alguien le envía un mensaje
2. Un apartado "Mensajes" en el menú del usuario con el historial de conversaciones
3. Poder responder mensajes dentro de la plataforma (bidireccional)

## Arquitectura

**Enfoque:** Polling con React Query (cada 15-30s). No se agrega WebSocket/Supabase Realtime por ahora — la app ya usa polling para notificaciones y listings.

## Plan de Implementación

### Fase 1: DB Schema + Migración

**Nuevo archivo:** `apps/api/src/database/schema/messages.schema.ts`
- Tabla `conversations`: listingId, buyerId, sellerId, status, listing snapshot fields (title, price, currency, image), lastMessageAt, lastMessageText, lastMessageSenderId, buyerUnreadCount, sellerUnreadCount
- Tabla `messages`: conversationId, senderId, content, readAt, createdAt
- Unique index en `(buyerId, listingId)` para evitar conversaciones duplicadas
- Index en `(conversationId, createdAt)` para paginación eficiente

**Modificar:**
- `apps/api/src/database/schema/enums.ts` → agregar `conversationStatusEnum` ('active', 'archived', 'blocked')
- `apps/api/src/database/schema/index.ts` → exportar `messages.schema`
- Generar migración con `drizzle-kit generate`

### Fase 2: Backend — MessagingModule

**Nuevos archivos:**
- `apps/api/src/messaging/messaging.module.ts` — módulo NestJS
- `apps/api/src/messaging/messaging.service.ts` — lógica de negocio
- `apps/api/src/messaging/messaging.controller.ts` — endpoints REST
- `apps/api/src/messaging/dto/*.ts` — DTOs de validación

**Endpoints:**

| Endpoint | Método | Descripción |
|---|---|---|
| `GET /conversations` | GET | Listar conversaciones del usuario (paginado) |
| `POST /listings/:id/conversations` | POST | Iniciar conversación desde una publicación |
| `GET /conversations/:id/messages` | GET | Mensajes de una conversación (paginado) |
| `POST /conversations/:id/messages` | POST | Enviar mensaje |
| `PATCH /conversations/:id/read` | PATCH | Marcar conversación como leída |
| `GET /conversations/unread-count` | GET | Total de no leídos |

**Modificar:**
- `apps/api/src/app.module.ts` → importar `MessagingModule`
- `apps/api/src/listings/listings.module.ts` → importar `MessagingModule`
- `apps/api/src/listings/listings.service.ts` → inyectar `MessagingService` y llamar `sendMessage + findOrCreateConversation` en `contactSeller()`

**Notificaciones:**
- Al enviar un mensaje, llamar `NotificationsService.send()` con `channel: 'in_app'`, `type: 'message'`
- El tipo `message` ya tiene icono mapeado en el frontend

### Fase 3: Frontend — API + Tipos

**Modificar:**
- `apps/web/types/index.ts` → agregar interfaces `Conversation` y `Message`
- `apps/web/lib/api.ts` → agregar objeto `conversations` con los métodos

### Fase 4: Frontend — Páginas de Mensajes

**Nuevos archivos:**
- `apps/web/app/(private)/messages/page.tsx` → lista de conversaciones
- `apps/web/app/(private)/messages/[conversationId]/page.tsx` → hilo de mensajes
- `apps/web/components/messages/ConversationList.tsx`
- `apps/web/components/messages/ConversationListItem.tsx`
- `apps/web/components/messages/MessageThread.tsx`
- `apps/web/components/messages/MessageBubble.tsx`
- `apps/web/components/messages/MessageInput.tsx`
- `apps/web/components/messages/ListingPreview.tsx`

**Polling:**
- Lista de conversaciones: `refetchInterval: 30_000`
- Hilo de mensajes: `refetchInterval: 15_000`

### Fase 5: Frontend — Navegación + Contact Flow

**Modificar:**
- `apps/web/components/layout/Navbar.tsx`:
  - Agregar icono de mensajes con badge de no leídos (junto a NotificationBell)
  - Agregar "Mensajes" en el dropdown del usuario
  - Agregar "Mensajes" en el menú mobile
- `apps/web/components/listing/ContactButtons.tsx`:
  - Después de enviar consulta, navegar a `/messages/{conversationId}` en vez de mostrar mensaje inline

### Fase 6: Data Migration (one-off)

Script SQL para backfill de `contact_inquiries` existentes a `conversations` + `messages`:
- Solo para `senderUserId IS NOT NULL`
- `ON CONFLICT (buyer_id, listing_id) DO NOTHING`

## Archivos a modificar (resumen)

**Nuevos (16):**
- Backend: schema, module, service, controller, 3x DTOs = 7
- Frontend: 2 páginas, 6 componentes = 8
- Script migración: 1

**Modificar (10):**
- `apps/api/src/database/schema/enums.ts`
- `apps/api/src/database/schema/index.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/listings/listings.module.ts`
- `apps/api/src/listings/listings.service.ts`
- `apps/web/types/index.ts`
- `apps/web/lib/api.ts`
- `apps/web/components/layout/Navbar.tsx`
- `apps/web/components/listing/ContactButtons.tsx`

## Verificación

1. Build API: `pnpm --filter @tradealo/api build`
2. Build web: `pnpm --filter @tradealo/web build` (o `pnpm --filter @tradealo-web lint`)
3. Probar flujo completo:
   - Enviar consulta desde página de listing → debe redirigir a `/messages/{id}`
   - Ver mensaje en la conversación
   - Ver badge de no leídos en navbar
   - Responder desde la conversación
   - Verificar que el otro usuario ve el mensaje
4. Probar edge cases:
   - Contactar propio listing → debe rechazar
   - Conversación con listing eliminado → debe mostrar snapshot
   - Rate limiting en mensajes
