# StockFlow — Resumen y arranque rápido

Tecnologías principales
- Next.js 16
- Prisma
- MongoDB
- Docker

Requisitos previos
- Docker y Docker Compose instalados
- Node.js y Yarn (o npm) instalados

Pasos para levantar el proyecto (desarrollo)

1. Fork y clonación

   - Hacer fork del repositorio y clonar localmente.

2. Levantar MongoDB en Docker

   - Iniciar los contenedores (modo detached):

```bash
docker-compose up -d
```

   - Acceder al shell de Mongo dentro del contenedor (ejemplo de contenedor llamado `prisma-mongo`):

```bash
docker exec -it prisma-mongo mongosh
```

3. Configurar el Replica Set (si es necesario)

   - En el shell de `mongosh` puede que necesites inicializar o reconfigurar el replica set para que Prisma pueda conectarse correctamente:

```js
rs.initiate({
  _id: "rs0",
  members: [ { _id: 0, host: "localhost:27017" } ]
})

// Si necesitas reconfigurar:
cfg = rs.conf()
cfg.members[0].host = "localhost:27017"
rs.reconfig(cfg, { force: true })
```

   - Nota: estos pasos configuran MongoDB internamente; no cambian la configuración de Prisma ni de Next.js.

4. Variables de entorno

   - Crea el archivo `.env` a partir de `.env.template` y establece al menos:

```
DATABASE_URL="mongodb://localhost:27017/tu_basedatos?directConnection=true&ssl=false"
AUTH_SECRET="una_clave_secreta_larga"
```

   - No subas jamás tu `.env` con credenciales de producción al repositorio.

5. Aplicar esquema de Prisma

   - Para sincronizar el esquema con la base de datos:

```bash
npx prisma db push
```

6. Levantar la aplicación

```bash
yarn dev
# o
npm run dev
```

7. Cuenta de prueba

   - Si el proyecto incluye una ruta de testing que crea un usuario, por ejemplo `/api/testing`, revisa su documentación o el código para ver las credenciales generadas (en tu versión actual eran `admin` / `admin123` — úsalo solo en desarrollo).

Advertencias y notas
- La base de datos local por defecto puede no tener contraseña; en producción debes configurar autenticación y backups.
- El replica set de MongoDB es necesario para algunas características de Prisma con MongoDB; si tienes problemas de conexión revisa los logs del contenedor y el estado del replica set (`rs.status()`).

Referencias útiles
- Documentación de Prisma: https://www.prisma.io/docs
- Documentación de MongoDB: https://www.mongodb.com/docs

