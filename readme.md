# 🍽️ Comitas App — Sistema Web de Gestión de Reservas

**Comitas App** es una aplicación web full stack moderna y profesional desarrollada como parte de mi portafolio. El sistema permite a los usuarios gestionar reservas en restaurantes de manera intuitiva, segura y eficiente.  
Incluye una **API RESTful en Java + Spring Boot** y una **interfaz web interactiva en HTML, CSS, JavaScript Vanilla y Bootstrap**.  
Todo el flujo, desde el login hasta la validación de reglas de negocio, ha sido cuidadosamente implementado con atención a la experiencia de usuario y buenas prácticas de desarrollo.

---

## 🔗 Proyecto en Producción

- 🔐 Backend desplegado (Render):  
  [https://comitas-app-backend.onrender.com](https://comitas-app-backend.onrender.com)

- 📑 Swagger UI (Documentación API):  
  [https://comitas-app-backend.onrender.com/swagger-ui/index.html](https://comitas-app-backend.onrender.com/swagger-ui/index.html)

---

## 🚀 Funcionalidades principales

- 🔐 Autenticación con JWT y sesiones protegidas
- 📆 Reservas con validaciones horarias y reglas de negocio
- 👤 Interfaz intuitiva adaptada a sesión activa
- 📑 Documentación automática con Swagger
- ⚙️ Arquitectura limpia y escalable en el backend
- 💬 Validaciones visuales con feedback inmediato en frontend
- 🧪 Tests automatizados de endpoints críticos

---

## 🛠️ Tecnologías Utilizadas

| Capa         | Herramientas                                   |
|--------------|------------------------------------------------|
| Backend      | Java 17 · Spring Boot · Spring Security · JWT · JPA · Flyway · MySQL/PostgreSQL · Swagger · Maven · GitHub Actions |
| Frontend     | HTML5 · CSS3 · JavaScript Vanilla · Bootstrap 5 · SweetAlert2 · LocalStorage |
| DevOps       | Render (hosting) · GitHub Actions · UptimeRobot |

---

## 🧠 Arquitectura del Proyecto

El sistema sigue una arquitectura clara en capas, con separación de responsabilidades tanto en backend como frontend.

### 📦 Backend (Java + Spring Boot)

```bash
cmsreservas/
├── controller/       # Endpoints REST (Auth, Reserva, Usuario, etc.)
├── domain/           # Entidades, DTOs y validaciones
├── infra/            # Configuraciones de seguridad y excepciones
├── repository/       # Interfaces JPA
├── service/          # Lógica de negocio
└── resources/        # Properties, migraciones Flyway
```

### 📦 Frontend (HTML, CSS, JavaScript Vanilla, Bootstrap)

```bash
Comitas-App/
├── index.html        # Página de inicio
├── login.html        # Página de login
├── reservas.html     # Página de reservas
├── js/               # Archivos JavaScript
├── css/              # Archivos CSS
└── readme.md         # Documentación del proyecto
```

## 💡 Reglas de Negocio Implementadas
| Regla                                                   | Estado |
| ------------------------------------------------------- | ------ |
| Login obligatorio para realizar reservas                | ✅      |
| Solo se permite una reserva por usuario y día           | ✅      |
| Reservas solo válidas de Jueves a Domingo (19:00–22:59) | ✅      |
| Validaciones visuales con SweetAlert2                   | ✅      |
| Protección de rutas con verificación de JWT             | ✅      |

### ✨ Experiencia de Usuario

    Interfaz responsiva y accesible

    Feedback visual inmediato ante errores o éxito

    Navegación intuitiva y adaptada a sesión

## ⚙️ Instalación local

Puedes ejecutar el backend y frontend localmente para desarrollar o contribuir.

### 🔧 1. Clonar los Repositorios

```bash
# Clonar el repositorio del backend
$ git clone https://github.com/Facuud2/Comitas-App.git

# Clonar el repositorio del frontend
$ git clone https://github.com/Facuud2/comitas-app.git
```

### 🖥️ 2. Backend — Configuración y ejecución

1. Crea el archivo application.properties en src/main/resources:
```bash
spring.datasource.url=jdbc:mysql://localhost:3306/comitas
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=none
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
```
2. Ejecuta el backend con Maven:
```bash
$ mvn spring-boot:run
```

3. Accede:

  API: http://localhost:8080

  Swagger UI: http://localhost:8080/swagger-ui/index.html

### 🌐 3. Frontend — Uso local

  Asegúrate de tener el backend corriendo en localhost:8080.

  Abre index.html en tu navegador (puedes usar Live Server o servidor local si prefieres).

    Asegúrate de que el frontend esté configurado para apuntar a http://localhost:8080 en las peticiones fetch.

### 🔐 Seguridad y Sesión

- El frontend utiliza localStorage para guardar el JWT, usuario e ID.

- El token se adjunta automáticamente en cada fetch protegido.

- Las páginas como reservas.html están protegidas por lógica de sesión activa.

- Redirecciones automáticas si el usuario no está autenticado.

### 🧪 Testing (Backend)

- Unit tests con JUnit y MockMvc

- Autenticación simulada con @WithMockUser

- Pruebas de endpoints y lógica de reserva

### 📈 Próximas funcionalidades (V2)

- ☐ Sistema de premios por cantidad de reservas y personas

- ☐ Registro de nuevos usuarios

- ☐ Alerta de expiracion de sesion activa

- ☐ Visualizar historial propio de reservas

- ☐ Implementacion de login con cifrado avanzado

## 👨‍💻 **Autor**

Facundo Carrizo Lucero  
Desarrollador Backend Java · Spring Boot

<a href="https://linkedin.com/in/facundo-dev" target="_blank">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
</a>
<a href="https://github.com/facuud2" target="_blank">
  <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
</a>

## ⭐ ¿Te gustó el proyecto?

¡No olvides dejar una estrella ⭐ en GitHub si te resultó útil o inspirador!
Este proyecto representa mi compromiso con el aprendizaje continuo y mi preparación para incorporarme profesionalmente a un equipo de desarrollo.

## 📜 Licencia

MIT © 2025 — Proyecto personal con fines educativos y profesionales