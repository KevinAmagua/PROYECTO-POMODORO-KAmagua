# HU-001

## Nombre

Control de sesión de estudio

## Prioridad

Alta

## Descripción

Como estudiante,
quiero iniciar, pausar y reiniciar un temporizador,
para concentrarme durante un tiempo definido.

## Reglas de negocio

- Iniciar sesión.
- Pausar sesión.
- Continuar sesión.
- Reiniciar sesión.

## Criterios de aceptación

Escenario: Iniciar el temporizador

Dado que estoy en la pantalla principal

Cuando presiono iniciar

Entonces empieza la cuenta regresiva con el tiempo de estudio que tengo configurado y veo los minutos y segundos que faltan

Escenario: Pausar y continuar

Dado que tengo el temporizador corriendo

Cuando lo pauso y luego lo reanudo

Entonces la cuenta sigue desde el tiempo en que la pausé

Escenario: Reiniciar el temporizador

Dado que tengo el temporizador corriendo o pausado

Cuando decido reiniciarlo y lo confirmo

Entonces el temporizador vuelve al tiempo inicial de la fase en la que estoy

Escenario: Cambiar de opinión al reiniciar

Dado que tengo el temporizador corriendo o pausado

Cuando decido reiniciarlo y cancelo

Entonces el temporizador conserva el tiempo que llevaba
