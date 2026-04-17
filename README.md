# 🍕 Pizzería App Core

## Descripción
Pizzería App Core es una plataforma moderna para la gestión de menús, diseñada para proporcionar una experiencia atractiva y eficiente tanto para clientes como para administradores. Con una interfaz intuitiva y un diseño acogedor con temática de pizzería artesanal, esta aplicación es perfecta para cualquier negocio de comida italiana.

## Vista Previa
La aplicación cuenta con un diseño acogedor y moderno, inspirado en la temática de una pizzería artesanal. El uso de colores cálidos, imágenes atractivas y un fondo con un toque de glassmorphism crea una experiencia visual agradable y profesional.

## Arquitectura
Nuestra pizzería app core utiliza Angular 19 como framework frontend, combinado con Signals para manejar los flujos de trabajo y un Interceptor JWT para proteger las rutas.

### Backend
La parte backend es una API en Flask que se comunica con una base de datos SQLite utilizando SQLAlchemy. También incluye protección de rutas para asegurar la seguridad de los datos.

### Instalación
Para levantar el entorno y correr app.py, sigue estos pasos:

1️⃣ Crea un entorno virtual (venv) con Python.
2️⃣ Instala las dependencias necesarias con pip: `pip install -r requirements.txt`.
3️⃣ Corre app.py con Flask: `flask run`.

### Frontend
1️⃣ Instala Node.js y npm.
2️⃣ Ejecuta el comando `npm install` en la carpeta del proyecto para instalar todas las dependencias.
3️⃣ Ejecuta el comando `ng serve` para iniciar el servidor de desarrollo de Angular.

## Sección de Features
- **Diseño Glassmorphism**: Nuestro diseño utiliza una combinación de gradientes y sombras para crear un efecto visual atractivo.
- **Uso de Signals**: Utilizamos Signals para manejar el estado del proyecto y mantener la información sincronizada entre los diferentes componentes.

## Estado actual
😊 ¡Ya tenemos el sistema de modelos y servicios sincronizados! Ahora estamos listos para agregar funcionalidad y mejorar la experiencia del usuario.
