# StockFlow

StockFlow es una aplicación de ejemplo para gestionar inventarios y movimientos (transacciones) entre tiendas. Incluye UI (Next.js App Router), lógica en server actions y persistencia con Prisma + MongoDB.

Principales tecnologías

- Next.js 16 (App Router)
- Prisma (MongoDB)
- MongoDB (Docker)
- Tailwind CSS, React, Zod

Requisitos

- Docker y Docker Compose
- Node.js (v18+ recomendado) y Yarn o npm

Quick start (desarrollo)

1. Clona el repositorio

```bash
git clone <tu-fork-o-repo>
cd stock-flow
```

2. Levantar MongoDB (Docker)

```bash
docker-compose up -d
```

Accede al shell de Mongo si necesitas inspeccionar el servidor:

```bash
docker exec -it prisma-mongo mongosh
```

3. (Si es necesario) Inicializar o reconfigurar el replica set

En `mongosh`:

```js
rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "localhost:27017" }] })
// o reconfiguración si ya existe
cfg = rs.conf(); cfg.members[0].host = "localhost:27017"; rs.reconfig(cfg, { force: true })
```

4. Variables de entorno

Duplica `.env.template` como `.env` y ajusta al menos estas variables:

```bash
DATABASE_URL="mongodb://localhost:27017/stockflow?directConnection=true&ssl=false"
NEXTAUTH_SECRET="una_clave_secreta_larga"
API_KEY=""
```

- `DATABASE_URL`: cadena de conexión a Mongo local (ver `prisma/schema.prisma` si cambias el nombre de la DB).
- `NEXTAUTH_SECRET`: secreto para NextAuth y sesiones.
- `API_KEY`: opcional, usado por algunas rutas de prueba.

No publiques tu `.env` con credenciales de producción.

5. Aplicar esquema de Prisma y generar cliente

Después de editar `prisma/schema.prisma` ejecuta:

```bash
npx prisma db push
npx prisma generate
```

Esto sincroniza el esquema con la base de datos y regenera el cliente de Prisma (importante después de cambios en modelos/relaciones).

6. Instalar dependencias y levantar la app

```bash
yarn install
yarn dev
# o con npm
npm install
npm run dev
```

7. Cargar datos de prueba

El proyecto incluye una ruta de seed para desarrollo: `GET /api/fake-data`. Abre esa URL en el navegador o usa `curl`.

```bash
curl http://localhost:3000/api/fake-data
```

La ruta crea un usuario y datos de ejemplo. Credenciales generadas (si se crea el usuario):

- Usuario: `testing@stockflow.com`
- Contraseña: `password123`

Notas importantes

- Prisma + MongoDB: cuando añades relaciones o cambias modelos, corre `npx prisma db push` y `npx prisma generate` para evitar errores de tipos en el cliente.
- `proxy.ts`: si usas un proxy central, colócalo en la raíz del proyecto (o donde Next lo espere). La ubicación incorrecta puede hacer que Next.js ignore el archivo.
- NextAuth / producción: revisa `NEXTAUTH_SECRET`, `DATABASE_URL` y variables de entorno en tu plataforma (Vercel, etc.). Si obtienes errores de signin, inspecciona los logs del servidor (se añadieron logs en `auth.authorize` para debugging).

Producción

- Configura autenticación y backups para MongoDB.
- Habilita TLS/SSL y credenciales en la conexión a la base de datos.

Comandos útiles

```bash
# Levantar MongoDB
docker-compose up -d

# Sincronizar prisma + generar cliente
npx prisma db push
npx prisma generate

# Levantar la app en modo desarrollo
yarn dev

# Ejecutar seed (dev)
curl http://localhost:3000/api/fake-data
```

Problemas comunes

- Error de conexión Prisma/Mongo: revisa `docker logs prisma-mongo` y el estado del replica set con `rs.status()`.
- Tipos de Prisma desactualizados: corre `npx prisma generate` después de cambiar el `schema.prisma`.
- Credenciales de NextAuth en producción: verifica `NEXTAUTH_SECRET` y el adaptador/DB.

Recursos

- Prisma: https://www.prisma.io/docs
- MongoDB: https://www.mongodb.com/docs

**Roadmap (ideas rápidas — 1 semana)**

- Sistema de roles y permisos: control de accesos por usuario (admin, manager, staff) y permisos por acción.
- Multi-tenant mínimo (Company / Store): asociar usuarios a una compañía o tienda para filtrar datos y aplicar scoping por compañía.
- CRUDs de usuarios y gestión de personal: creación, edición, roles y asignación a tiendas.
- Punto de Venta (POS) básico: registrar ventas, clientes y devoluciones; integración con stocks al cierre de la venta.
- Integración de mensajería/encuestas: opción de enviar notificaciones o encuestas de satisfacción (ej. WhatsApp vía WhatSurvey.mx o API similar).
- Panel de reportes y métricas por tienda: ventas, movimientos, top productos y alertas de stock.


