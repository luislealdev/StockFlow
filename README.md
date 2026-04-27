Este proyecto usa las siguientes tecnologías:
Next.js 16
Prisma
Mongodb
Docker

Pasos para levantar el proyecto:

1. Hacer un fork
2. Descargar el repositorio
3. Levantar el contenedor de docker con docker-compose up -d (Para detached)
   Inicializa replica set docker exec -it prisma-mongo mongosh (verás que la consola sigue corriendo),
   configura: cfg = rs.conf()

cfg.members[0].host = "localhost:27017"

rs.reconfig(cfg, { force: true })
Estás configurando Mongo internamente, no Prisma ni Next.js.

Es equivalente a:

- crear una base de datos
- activar una feature del servidor
- configurar un cluster de 1 nodo

5. Establecer la variable de entorno DATABASE_URL (puedes tomar el archivo .env.template y renombrarlo a .env)
   Establecer la variable de entorno AUTH_SECRET en el archivo .env mediante el comando:
6. Hacer la migración de prisma con npx prisma db push
   Levantar la aplicación con yarn dev (o tu gestor de módulos de node preferido)
7. Ingresar con el usuario de prueba que se crea al correr /api/testing con contraseñas: admin, admin123

EVITA EN CUALQUIER MOMENTO SUBIR TU ARCHIVO .ENV USANDO UNA BASE DE DATOS EN PRODUCCIÓN
