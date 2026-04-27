# Desarrollo de StockFlow

Este documento recoge el plan inicial y los pasos inmediatos para poner en marcha el proyecto StockFlow. Es un borrador vivo: se actualizará según avance el desarrollo y aparezcan nuevas decisiones.

**Objetivo:** Crear una aplicación con Next.js que use Server Actions y una base de datos MongoDB gestionada vía Prisma, con validaciones en el servidor y una UI sencilla en el frontend.

**Stack y herramientas (propuesta):**
- **Frontend / framework:** Next.js (Server Actions cuando proceda)
- **Base de datos:** MongoDB (contenedor Docker para desarrollo local)
- **ORM:** Prisma (con conectividad a MongoDB)
- **Validación:** Zod
- **Autenticación:** NextAuth (implementación sencilla)
- **Ayudas:** Docker, Yarn, Visual Studio Code, Copilot para UI

## Pasos inmediatos

1. Crear el repositorio en GitHub y subir el primer commit.
2. Definir el esquema de Prisma para usar con MongoDB.
3. Levantar MongoDB en un contenedor Docker para desarrollo local.
4. Verificar la conexión y aplicar migraciones/necesarios (según flujo con Prisma + Mongo).
5. Crear esquemas Zod para validar datos antes de procesarlos en las Server Actions.
6. Implementar Server Actions y, si es necesario, una API REST/HTTP sencilla para complementar la integración.
7. Crear APIs/handlers básicos por modelo (o actions equivalentes).
8. Construir formularios y tablas (grids) en el frontend y adaptarlos para llamadas del servidor o la API.
9. Añadir autenticación básica con NextAuth y proteger rutas/acciones necesarias.

## Notas y decisiones iniciales

- Prefiero usar Server Actions cuando permita un flujo más simple y reutilizable; si algún caso lo requiere, proporcionaré la misma funcionalidad vía API para poder elegir desde el frontend.
- Durante el desarrollo usaré la documentación oficial de Prisma y MongoDB. Consultaré ChatGPT y utilizaré Copilot en VS Code únicamente para diseño de interfaces y snippets de UI; las partes de servidor las revisaré manualmente para evitar mezclar responsabilidades.
- Mi principal reto actual: refrescar conceptos de Mongoose/MongoDB y configurar correctamente Docker para la base de datos local; evaluaré si usar Mongoose o solo Prisma según conveniencia.

Actualizaré este archivo con comentarios y cambios conforme avance el proyecto.

Definitivamente también tomaré un poco de café y escucharé música de Manuel Medrano (requerido totalmente).

En mongo levanté un servidor con docker exec -it prisma-mongo mongosh y rs.initiate() pero me dio un error: Error: MongoDB error
Kind: Server selection timeout: No available servers. Topology: { Type: ReplicaSetNoPrimary, Set Name: rs0" }, labels: {}, source: None
   0: schema_commands::commands::schema_push::Calculate from database
             at schema-engine/commands/src/commands/schema_push.rs:40
   1: schema_core::state::SchemaPush
             at schema-engine/core/src/state.rs:545 al parecer esto por las replicas, al parecer no tenía un PRIMARY, usé rs.initiate({

  _id: "rs0",

  members: [

    { _id: 0, host: "localhost:27017" }

  ]

}) tive que bajar el contenedor y volver a crearlo para ahora sí configurar correctamente con cfg = rs.conf()

cfg.members[0].host = "localhost:27017"

rs.reconfig(cfg, { force: true }) dentro de la configuración de mongoose.