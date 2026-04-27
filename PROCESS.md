# Desarrollo de StockFlow

Este documento recoge el plan inicial y los pasos inmediatos para poner en marcha el proyecto StockFlow. Es un borrador vivo: se actualizará según avance el desarrollo.

**Objetivo:** Crear una aplicación con Next.js que utilice Server Actions cuando sea apropiado, con una capa de datos en MongoDB gestionada por Prisma, validación con Zod y una UI sencilla en el frontend.

**Stack y herramientas (propuesta):**
- **Frontend / framework:** Next.js
- **Base de datos:** MongoDB (contenedor Docker para desarrollo local)
- **ORM:** Prisma
- **Validación:** Zod
- **Autenticación:** NextAuth
- **Utilidades:** Docker, Yarn, Visual Studio Code, Copilot (solo para UI)

## Checklist — Pasos inmediatos

- [ ] Inicializar proyecto Next.js (ya hecho si usaste `yarn create next-app`).
- [ ] Crear repositorio en GitHub y subir el primer commit.
- [ ] Definir el esquema de Prisma para MongoDB.
- [ ] Levantar MongoDB en Docker (contenedor para desarrollo local).
- [ ] Configurar replica set si Prisma/feature lo requiere.
- [ ] Establecer variables de entorno en `.env` (ej. `DATABASE_URL`, `AUTH_SECRET`).
- [ ] Aplicar esquema de Prisma: `npx prisma db push`.
- [ ] Crear esquemas Zod para validación en server actions.
- [ ] Implementar Server Actions / API endpoints básicos por modelo.
- [ ] Construir formularios y tablas en frontend (adaptables a Server Actions o API).
- [ ] Añadir autenticación básica con NextAuth y proteger rutas necesarias.

## Notas y decisiones

- Usaré Server Actions cuando simplifiquen el flujo; si hace falta, expondré la misma funcionalidad vía API para permitir elección desde el frontend.
- Copilot se usará únicamente para la capa de UI; revisaré manualmente todo código de servidor.
- Evaluaré si es necesario usar Mongoose además de Prisma; la intención es preferir Prisma cuando cubra las necesidades.

## Problemas y soluciones (MongoDB / Replica Set)

- Síntoma: al ejecutar `rs.initiate()` en `mongosh` apareció un error de "Server selection timeout" o "ReplicaSetNoPrimary".
- Causa común: el replica set no quedó con un PRIMARY o la configuración de hosts no coincide con cómo se exponen los puertos desde el contenedor.
- Pasos de corrección que funcionaron:

```js
// En el shell del contenedor
rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "localhost:27017" }]
})

// Si es necesario reconfigurar:
cfg = rs.conf()
cfg.members[0].host = "localhost:27017"
rs.reconfig(cfg, { force: true })
```

- Nota: dependiendo de cómo estés conectando (desde el host o desde otro contenedor), puede que debas usar el nombre del contenedor o la IP en lugar de `localhost`. Revisa `rs.status()` y los logs del contenedor si persisten los problemas.

## Dependencias añadidas 

- `zod@3.25.76` - Manejo de validación de datos
- `bcryptjs@^3.0.2` - Encriptación de contra
- `next-auth@^5.0.0-beta.4` - Manejo de autenticación mediante JWT
- `recharts@2.15.4` - Gráficas visuales
- `sonner@^1.7.4` - Elementos de confirmaciones visuales
- `@hookform/resolvers@^3.10.0` - Uso de zod con react hook form
- `lucide-react@^0.454.0` - Íconos de react
