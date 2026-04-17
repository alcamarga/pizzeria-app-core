Pizzeria App Core (Backend & Frontend v2)
==========================================

🍕️ **Arquitectura**
-------------------

Nuestra pizzería app core utiliza Angular 19 como framework frontend, combinado con Signals para manejar los flujos de trabajo y un Interceptor JWT para proteger las rutas.

**Backend**
---------

La parte backend es una API en Flask que se comunica con una base de datos SQLite utilizando SQLAlchemy. También incluye protección de rutas para asegurar la seguridad de los datos.

**Instalación**
-------------

Para levantar el entorno y correr app.py, sigue estos pasos:

1️⃣ Crea un entorno virtual (venv) con Python.
2️⃣ Instala las dependencias necesarias con pip: `pip install -r requirements.txt`.
3️⃣ Corre app.py con Flask: `flask run`.

**Estado actual**
----------------

😊 ¡Ya tenemos el sistema de modelos y servicios sincronizados! Ahora estamos listos para agregar funcionalidad y mejorar la experiencia del usuario.Pizzeria App Core (Backend & Frontend v2)
==========================================

[![Badge Angular 19](https://img.shields.io/badge/Angular-19-red)](https://angular.io)
[![Badge Flask](https://img.shields.io/badge/Flask-blue)](https://flask.palletsprojects.com/en/2.0.x/)
[![Badge SQLite](https://img.shields.io/badge/SQLite-green)](https://www.sqlite.org/)
[![Badge JWT](https://img.shields.io/badge/JWT-purple)](https://jwt.io/)

**Arquitectura Detallada**
-------------------------

La carpeta core contiene los siguientes componentes:

* **Core**: El corazón del proyecto, donde se encuentra la lógica de negocio y la integración con las bases de datos.
* **Frontend**: La parte visual del proyecto, que se encarga de mostrar la información a los usuarios.
* **Backend**: La API en Flask que maneja las solicitudes y respuestas.

Para asegurar la seguridad, usamos interceptores JWT para proteger las rutas. Esto permite que solo los usuarios autenticados accedan a ciertas áreas del proyecto.

**Guía de Inicio Rápido**
-------------------------

### Backend

1️⃣ Crea un entorno virtual (venv) con Python.
2️⃣ Instala las dependencias necesarias con pip: `pip install -r requirements.txt`.
3️⃣ Corre app.py con Flask: `flask run`.

### Frontend

1️⃣ Instala Node.js y npm.
2️⃣ Ejecuta el comando `npm install` en la carpeta del proyecto para instalar todas las dependencias.
3️⃣ Ejecuta el comando `ng serve` para iniciar el servidor de desarrollo de Angular.

**Sección de Features**
------------------------

* **Diseño Glassmorphism**: Nuestro diseño utiliza una combinación de gradientes y sombras para crear un efecto visual atractivo.
* **Uso de Signals**: Utilizamos Signals para manejar el estado del proyecto y mantener la información sincronizada entre los diferentes componentes.

**Estado actual**
----------------

😊 ¡Ya tenemos el sistema de modelos y servicios sincronizados! Ahora estamos listos para agregar funcionalidad y mejorar la experiencia del usuario.