# API Documentation - Roomies Chile Matching System

Base URL: `http://localhost:3000`

Todos los endpoints (excepto login/register) requieren header de autorización:
```
Authorization: Bearer {token}
```

---

## 🔐 Autenticación

### POST /register
Registrar nuevo usuario.
```json
{
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

### POST /login
Iniciar sesión.
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nombre": "Juan",
    ...
  }
}
```

### GET /profile
Obtener perfil del usuario actual.

### PUT /profile
Actualizar perfil del usuario.

---

## 👆 Swipes

### POST /swipes
Crear un swipe (like o dislike).

Request:
```json
{
  "swipe": {
    "target_id": 5,
    "target_type": "Listing",
    "direction": "like"
  }
}
```

Response:
```json
{
  "swipe": { ... },
  "is_match": true,
  "message": "¡Es un match! 🎉"
}
```

### GET /swipes/potential
Obtener stack de cards para hacer swipe (ordenadas por compatibilidad).

Response:
```json
{
  "cards": [
    {
      "id": 5,
      "type": "Listing",
      "data": {
        "title": "Habitación en Providencia",
        "price": 250000,
        ...
      },
      "compatibility_score": 87
    },
    ...
  ],
  "count": 15
}
```

### GET /swipes/history
Historial de swipes del usuario.

Response:
```json
{
  "swipes": [
    {
      "id": 123,
      "direction": "like",
      "target_type": "Listing",
      "target_id": 5,
      "created_at": "2024-05-27T22:00:00Z"
    },
    ...
  ]
}
```

---

## 💕 Matches

### GET /matches
Listar todos los matches del usuario.

Query params:
- `filter`: "active" | "archived" | "blocked" (default: "active")
- `page`: número de página

Response:
```json
{
  "matches": [
    {
      "id": 42,
      "compatibility_score": 87,
      "status": "active",
      "created_at": "2024-05-27T22:00:00Z",
      "other_user": {
        "id": 10,
        "nombre": "María",
        "foto_perfil": "url..."
      },
      "listing": {
        "id": 5,
        "title": "Habitación en Providencia",
        "price": 250000,
        "comuna": "Providencia"
      },
      "last_message": {
        "content": "Hola! Me interesa...",
        "created_at": "2024-05-27T22:30:00Z",
        "sender_id": 10
      },
      "unread_count": 2
    },
    ...
  ]
}
```

### GET /matches/:id
Detalles completos de un match específico.

Response:
```json
{
  "match": { ... },
  "other_user": {
    "id": 10,
    "nombre": "María",
    "edad": 25,
    "bio": "Diseñadora, amante de los gatos",
    "profesion": "Diseñadora Gráfica",
    "hobbies": ["arte", "yoga", "cine"],
    ...
  },
  "listing": { ... },
  "messages_preview": [ ... ]
}
```

### PATCH /matches/:id/archive
Archivar un match.

### PATCH /matches/:id/block
Bloquear un match.

### PATCH /matches/:id/activate
Reactivar un match archivado.

### GET /matches/stats
Estadísticas de matching del usuario.

Response:
```json
{
  "total_matches": 15,
  "active_matches": 12,
  "archived_matches": 3,
  "matches_with_messages": 8,
  "matches_with_unread": 3,
  "total_swipes": 50,
  "likes_given": 35,
  "match_rate": 42.86
}
```

---

## 💬 Mensajes

### GET /matches/:match_id/messages
Listar mensajes de una conversación.

Query params:
- `page`: número de página
- `skip_mark_read`: true (opcional, para no marcar como leídos)

Response:
```json
{
  "messages": [
    {
      "id": 500,
      "content": "Hola! Me interesa conocer más...",
      "sender": {
        "id": 10,
        "nombre": "María",
        "foto_perfil": "url..."
      },
      "is_mine": false,
      "read_at": "2024-05-27T22:45:00Z",
      "created_at": "2024-05-27T22:30:00Z"
    },
    ...
  ]
}
```

### POST /matches/:match_id/messages
Enviar un mensaje.

Request:
```json
{
  "message": {
    "content": "Hola! Me interesa conocer más sobre la habitación..."
  }
}
```

### PATCH /matches/:match_id/messages/:id/mark_as_read
Marcar un mensaje específico como leído.

### PATCH /matches/:match_id/messages/mark_all_as_read
Marcar todos los mensajes de la conversación como leídos.

### GET /matches/:match_id/messages/unread_count
Cantidad de mensajes no leídos en una conversación específica.

Response:
```json
{
  "unread_count": 3
}
```

### GET /messages/unread_total
Total de mensajes no leídos en todas las conversaciones.

Response:
```json
{
  "unread_total": 8
}
```

---

## 🏠 Listings (Endpoints existentes)

### GET /listings
Listar todas las publicaciones.

### GET /listings/:id
Ver detalles de una publicación.

### POST /listings
Crear publicación (requiere autenticación).

### PUT /listings/:id
Actualizar publicación (requiere ser el dueño).

### DELETE /listings/:id
Eliminar publicación (requiere ser el dueño).

---

## 📊 Ejemplos de Flujos

### Flujo de Matching:

1. Usuario demandante completa onboarding
2. `GET /swipes/potential` → obtiene stack de listings
3. `POST /swipes` con `direction: "like"` → hace swipe
4. Si hay match mutuo: response incluye `is_match: true`
5. `GET /matches` → ve el nuevo match
6. `GET /matches/:id` → ve detalles del match
7. `POST /matches/:match_id/messages` → envía primer mensaje
8. Chat habilitado ✅

### Flujo de Chat:

1. `GET /matches` → lista de matches con unread_count
2. `GET /matches/:match_id/messages` → abre conversación (auto-marca como leído)
3. `POST /matches/:match_id/messages` → envía mensaje
4. Polling o WebSockets para nuevos mensajes
5. `GET /messages/unread_total` → badge global de no leídos

---

## ⚠️ Códigos de Error

- `200` - OK
- `201` - Created
- `401` - Unauthorized (token inválido)
- `404` - Not Found
- `422` - Unprocessable Entity (validación fallida)
- `500` - Internal Server Error

---

## 🔧 Notas Técnicas

- **Paginación**: Algunas endpoints retornan paginación (si está implementado Kaminari)
- **Autenticación**: JWT con expiración de 24 horas
- **Matching Score**: Calculado en tiempo real con MatchingService
- **Polling**: Para mensajes nuevos, hacer polling cada 5-10 segundos o implementar WebSockets
- **Caché**: Considerar cachear scores de compatibilidad para performance

---

## 🚀 Testing con cURL

```bash
# Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"password123"}'

# Obtener potential matches
curl -X GET http://localhost:3000/swipes/potential \
  -H "Authorization: Bearer YOUR_TOKEN"

# Hacer swipe
curl -X POST http://localhost:3000/swipes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"swipe":{"target_id":5,"target_type":"Listing","direction":"like"}}'

# Ver matches
curl -X GET http://localhost:3000/matches \
  -H "Authorization: Bearer YOUR_TOKEN"

# Enviar mensaje
curl -X POST http://localhost:3000/matches/42/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":{"content":"Hola! Me interesa la habitación"}}'
```
