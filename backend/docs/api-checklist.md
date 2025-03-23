# ✅ API Endpoint Checklist – LIGENIA

Checklist para verificar la implementación completa de rutas, controladores, validaciones y pruebas por cada endpoint definido.

---

## 🔐 Autenticación

| Método | Endpoint               | Implementado | Comentarios                   |
|--------|------------------------|--------------|-------------------------------|
| POST   | `/api/auth/register`   | ✅           | Registro de usuarios          |
| POST   | `/api/auth/login`      | ✅           | Inicio de sesión              |
| POST   | `/api/auth/logout`     | ✅           | Cierre de sesión              |
| GET    | `/api/auth/profile`    | ✅           | Obtener perfil del usuario    |

---

## 👤 Usuarios

| Método | Endpoint                                | Implementado | Comentarios                            |
|--------|-----------------------------------------|--------------|----------------------------------------|
| GET    | `/api/users`                            | ✅           | Listar usuarios                        |
| GET    | `/api/users/{id}`                       | ✅           | Obtener usuario por ID                 |
| PUT    | `/api/users/{id}`                       | ✅           | Actualizar usuario                     |
| PUT    | `/api/users/{id}/password`              | ✅           | Cambiar contraseña del usuario         |
| GET    | `/api/users/{id}/statistics`            | ✅           | Obtener estadísticas del usuario       |
| GET    | `/api/users/{id}/preferences`           | ✅           | Obtener preferencias del usuario       |
| PUT    | `/api/users/{id}/preferences`           | ✅           | Actualizar preferencias del usuario    |

---

## 🏆 Torneos

| Método | Endpoint                                | Implementado | Comentarios                            |
|--------|-----------------------------------------|--------------|----------------------------------------|
| GET    | `/api/tournaments`                      | ✅           | Listar torneos con filtros             |
| GET    | `/api/tournaments/{id}`                 | ✅           | Obtener torneo por ID                  |
| POST   | `/api/tournaments`                      | ✅           | Crear torneo                           |
| PUT    | `/api/tournaments/{id}`                 | ✅           | Actualizar torneo                      |
| DELETE | `/api/tournaments/{id}`                 | ✅           | Eliminar torneo                        |
| POST   | `/api/tournaments/{id}/register`        | ✅           | Registrarse en un torneo               |
| GET    | `/api/tournaments/{id}/standings`       | ✅           | Obtener clasificación del torneo       |

---

## 🥎 Partidos

| Método | Endpoint                                | Implementado | Comentarios                            |
|--------|-----------------------------------------|--------------|----------------------------------------|
| GET    | `/api/matches`                          | ✅           | Listar partidos con filtros            |
| GET    | `/api/matches/{id}`                     | ✅           | Obtener partido por ID                 |
| POST   | `/api/matches`                          | ✅           | Crear partido                          |
| PUT    | `/api/matches/{id}`                     | ✅           | Actualizar partido (resultados)        |
| GET    | `/api/tournaments/{id}/matches`         | ✅           | Obtener partidos de un torneo          |
| GET    | `/api/tournaments/{id}/bracket`         | ✅           | Obtener el cuadro de un torneo         |

---

## 📈 Rankings

| Método | Endpoint                                | Implementado | Comentarios                            |
|--------|-----------------------------------------|--------------|----------------------------------------|
| GET    | `/api/rankings`                         | ✅           | Obtener ranking general de jugadores   |
| GET    | `/api/rankings/{categoryId}`            | ✅           | Obtener ranking por categoría          |

---

## 📊 Historial y Rendimiento

| Método | Endpoint                                             | Implementado | Comentarios                            |
|--------|------------------------------------------------------|--------------|----------------------------------------|
| GET    | `/api/users/{id}/performance/{year}`                | ✅           | Obtener rendimiento anual              |
| GET    | `/api/users/{id}/match-history`                     | ✅           | Historial de partidos del usuario      |

---

## 🧪 Validación y Pruebas

- [x] Todas las rutas tienen validación Zod (`validateBody`, `validateParams`, `validateQuery`)
- [x] Cada entidad tiene su archivo de validación en `api/validations/`
- [ ] Todas las pruebas de integración cubren casos OK y errores
- [ ] Todos los tests están pasando correctamente

---

## 📘 Leyenda

| Símbolo | Significado                          |
|---------|--------------------------------------|
| ✅      | Implementado                         |
| ⬜️      | Pendiente o incompleto               |

---

## 🕓 Última revisión: 2025-03-22 16:00
