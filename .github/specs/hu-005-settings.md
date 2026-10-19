# HU-005

## Identificador

HU-005

## Nombre

Ajustar los tiempos del pomodoro

## Prioridad

Media

## Riesgo

Bajo

## Descripción

Como estudiante,
quiero cambiar la duración del estudio, de los descansos y la cantidad de pomodoros antes del descanso largo,
para adaptar la técnica a mi ritmo de trabajo.

---

## Objetivo

Permitir que el usuario personalice la técnica Pomodoro según sus preferencias, manteniendo la configuración almacenada localmente incluso después de cerrar la aplicación.

---

## Configuraciones Disponibles

### Tiempo de estudio

- Valor por defecto: 25 minutos
- Mínimo: 1 minuto
- Máximo: 180 minutos

### Descanso corto

- Valor por defecto: 5 minutos
- Mínimo: 1 minuto
- Máximo: 60 minutos

### Descanso largo

- Valor por defecto: 15 minutos
- Mínimo: 1 minuto
- Máximo: 120 minutos

### Pomodoros por ciclo

- Valor por defecto: 4
- Mínimo: 1
- Máximo: 10

---

## Persistencia

Las configuraciones deben guardarse en almacenamiento local.

La aplicación debe recuperar automáticamente estos valores cuando vuelva a abrirse.

---

## Reglas de Negocio

### RN-01

Toda configuración válida debe almacenarse inmediatamente después de guardar.

### RN-02

Las configuraciones deben sobrevivir al cierre de la aplicación.

### RN-03

No se permiten valores vacíos.

### RN-04

No se permiten valores iguales a cero.

### RN-05

No se permiten valores negativos.

### RN-06

Si una fase está actualmente en ejecución, los cambios realizados no deben afectar la fase actual.

### RN-07

Las modificaciones aplican únicamente a las próximas fases.

### RN-08

Debe existir una opción para restaurar todas las configuraciones a los valores predeterminados del sistema.

---

## Valores Predeterminados

Estudio: 25 minutos

Descanso corto: 5 minutos

Descanso largo: 15 minutos

Pomodoros por ciclo: 4

---

## Funcionalidad de Restablecimiento

La pantalla de configuración debe incluir una acción:

"Restablecer valores predeterminados"

Al seleccionarla:

1. Mostrar confirmación.
2. Restablecer todos los valores a los definidos por defecto.
3. Guardar automáticamente la nueva configuración.
4. Actualizar la interfaz de usuario.

---

## Criterios de Aceptación

### Escenario 1: Cambiar un tiempo

Dado que estoy en la pantalla de ajustes

Cuando cambio un tiempo y guardo

Entonces el nuevo valor se utiliza desde la próxima fase y permanece guardado al cerrar la aplicación.

---

### Escenario 2: Ingresar un valor inválido

Dado que estoy en la pantalla de ajustes

Cuando ingreso un valor vacío, cero o fuera del rango permitido

Entonces la aplicación no guarda el cambio y muestra un mensaje indicando el rango válido.

---

### Escenario 3: Restablecer configuración

Dado que he modificado los tiempos predeterminados

Cuando selecciono "Restablecer valores predeterminados" y confirmo

Entonces la aplicación restaura:

- Estudio: 25 minutos
- Descanso corto: 5 minutos
- Descanso largo: 15 minutos
- Pomodoros por ciclo: 4

y guarda automáticamente dichos valores.

---

### Escenario 4: Fase en ejecución

Dado que tengo una fase activa

Cuando modifico la duración de esa misma fase

Entonces la fase en curso continúa con el tiempo original

Y el nuevo valor se aplica únicamente a la siguiente fase.

---

## Dependencias

- Settings Screen
- AsyncStorage
- Settings Manager
- Validation Service

---

## Componentes Relacionados

- SettingsScreen
- SettingsForm
- SettingsService
- SettingsStorage