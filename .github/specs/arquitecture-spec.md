# Architecture Specification

## Tipo de arquitectura

MVVM Simplificado

## Capas

### Presentation Layer

Responsable de la interfaz gráfica.

Componentes:

- Home Screen
- Settings Screen
- Reusable Components

### Application Layer

Orquestación de lógica.

Componentes:

- Timer Manager
- Session Manager
- Settings Manager

### Domain Layer

Reglas de negocio.

Componentes:

- Pomodoro Engine
- Phase Controller
- Countdown Calculator

### Infrastructure Layer

Servicios externos.

Componentes:

- AsyncStorage
- Notification Service
- Alarm Service

## Principio

Las pantallas nunca manejan lógica compleja.

Toda la lógica se centraliza en servicios especializados.