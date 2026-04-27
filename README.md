Este proyecto usa las siguientes tecnologías:
Next.js 16
Prisma
Mongodb
Docker

Pasos para levantar el proyecto:
1. Hacer un fork
2. Descargar el repositorio 
3. Levantar el contenedor de docker con docker-compose up -d (Para detached)
5. Establecer la variable de entorno DATABASE_URL (puedes tomar el archivo .env.template y renombrarlo a .env)
4. Hacer la migración de prisma
Levantar la aplicación con yarn dev (o tu gestor de módulos de node preferido)
5. Ingresar con el usuario de prueba que se crea al correr /api/testing con contraseñas: admin, admin123

EVITA EN CUALQUIER MOMENTO SUBIR TU ARCHIVO .ENV USANDO UNA BASE DE DATOS EN PRODUCCIÓN
