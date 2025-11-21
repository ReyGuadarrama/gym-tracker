# Gym Tracker - Aplicación Web para Control de Entrenamientos

Una aplicación web completa y minimalista para llevar el control de tus entrenamientos en el gimnasio, creada con React, Vite, Tailwind CSS y Recharts.

## Características

### 1. Gestión de Rutinas
- Crea rutinas personalizadas con múltiples ejercicios
- Especifica series, repeticiones y tiempo de descanso para cada ejercicio
- Edita y elimina rutinas existentes
- Visualiza todas tus rutinas de forma organizada

### 2. Calendario
- Programa tus rutinas en días específicos
- Vista semanal para planificar tu entrenamiento
- Navegación fácil entre semanas
- Indicador visual del día actual

### 3. Modo Entrenamiento
- Selecciona una rutina para comenzar
- Ve los datos del último entrenamiento de cada ejercicio (peso y reps)
- Registra el peso y repeticiones reales de cada serie
- **Temporizadores integrados:**
  - Cronómetro para medir el tiempo de cada serie
  - Temporizador de descanso automático entre series
- Seguimiento del progreso durante el entrenamiento
- Cálculo automático del tiempo total del entrenamiento

### 4. Visualización de Progreso
- Gráficas interactivas por ejercicio
- **Tres tipos de gráficas:**
  - Progresión de peso en el tiempo
  - Progresión de repeticiones
  - Volumen total (peso × reps)
- Estadísticas detalladas:
  - Peso máximo levantado
  - Máximo de repeticiones
  - Volumen total acumulado
  - Promedio de repeticiones
  - Total de series realizadas
- Tabla con historial detallado de cada serie

## Tecnologías Utilizadas

- **React 18** - Framework de interfaz de usuario
- **Vite** - Build tool y servidor de desarrollo
- **React Router** - Navegación entre páginas
- **Tailwind CSS** - Estilos y diseño responsivo
- **Recharts** - Gráficas interactivas
- **date-fns** - Manejo de fechas
- **lucide-react** - Iconos modernos
- **localStorage** - Persistencia de datos en el navegador

## Instalación y Uso

### Requisitos previos
- Node.js 18+

### Pasos para ejecutar

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador:**
   La aplicación estará disponible en `http://localhost:5173/`

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

5. **Vista previa de la versión de producción:**
   ```bash
   npm run preview
   ```

## Estructura del Proyecto

```
gym-app/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── Layout.jsx    # Layout principal con navegación
│   │   ├── Button.jsx    # Componente de botón
│   │   ├── Input.jsx     # Componente de input
│   │   ├── Card.jsx      # Componente de tarjeta
│   │   ├── Timer.jsx     # Temporizador de cuenta regresiva
│   │   └── Stopwatch.jsx # Cronómetro
│   ├── pages/            # Páginas de la aplicación
│   │   ├── Home.jsx      # Dashboard principal
│   │   ├── Rutinas.jsx   # Gestión de rutinas
│   │   ├── Calendario.jsx # Programación de rutinas
│   │   ├── Entrenar.jsx  # Modo entrenamiento
│   │   └── Progreso.jsx  # Gráficas y estadísticas
│   ├── context/          # Estado global
│   │   └── AppContext.jsx # Contexto de la aplicación
│   ├── hooks/            # Custom hooks
│   │   └── useLocalStorage.js # Hook para localStorage
│   ├── App.jsx           # Componente principal
│   ├── main.jsx          # Punto de entrada
│   └── index.css         # Estilos globales con Tailwind
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Guía de Uso

### Crear una Rutina
1. Ve a la sección "Rutinas"
2. Haz clic en "Nueva Rutina"
3. Ingresa el nombre de la rutina
4. Agrega ejercicios con sus series, repeticiones y tiempo de descanso
5. Guarda la rutina

### Programar Entrenamientos
1. Ve a "Calendario"
2. Haz clic en el día que deseas programar
3. Selecciona la rutina que quieres realizar ese día

### Realizar un Entrenamiento
1. Ve a "Entrenar"
2. Selecciona la rutina a realizar
3. Para cada ejercicio y serie:
   - Verás los datos del último entrenamiento (si existe)
   - Ingresa el peso y repeticiones realizadas
   - Inicia el cronómetro durante la serie
   - Detén el cronómetro al finalizar
   - El temporizador de descanso se iniciará automáticamente
4. Completa todos los ejercicios
5. El entrenamiento se guardará automáticamente

### Ver tu Progreso
1. Ve a "Progreso"
2. Selecciona un ejercicio del menú desplegable
3. Visualiza las gráficas de evolución
4. Revisa las estadísticas y el historial detallado

## Almacenamiento de Datos

La aplicación utiliza **localStorage** del navegador para guardar todos los datos:
- Las rutinas creadas
- El calendario de entrenamientos
- El historial de entrenamientos realizados

**Nota:** Los datos persisten en tu navegador, pero no se sincronizan entre dispositivos. Para exportar o respaldar tus datos, puedes usar las herramientas de desarrollo del navegador para acceder al localStorage.

## Diseño

La aplicación cuenta con un diseño minimalista, limpio y profesional:
- Interfaz intuitiva y fácil de usar
- Responsive (funciona en móviles, tablets y escritorio)
- Navegación por pestañas en la parte inferior (estilo app móvil)
- Paleta de colores profesional
- Feedback visual claro durante los entrenamientos

## Próximas Mejoras Posibles

- Exportar/importar datos en formato JSON
- Backend para sincronización entre dispositivos
- Autenticación de usuarios
- Cálculo de 1RM (una repetición máxima)
- Plantillas de rutinas predefinidas
- Modo oscuro
- Notificaciones push para recordatorios
- Integración con wearables

## Licencia

Este proyecto es de código abierto y está disponible para uso personal.

## Autor

Creado con Claude Code para ayudarte a alcanzar tus metas de fitness.
