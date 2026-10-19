# Data Model Specification

## UserSettings

### Campos

studyDuration

Tipo:
number

Valor por defecto:
25

Unit:
minutes

---

shortBreakDuration

Tipo:
number

Valor por defecto:
5

---

longBreakDuration

Tipo:
number

Valor por defecto:
15

---

pomodorosPerCycle

Tipo:
number

Valor por defecto:
4

## SessionState

currentPhase

Valores:

- STUDY
- SHORT_BREAK
- LONG_BREAK

status

Valores:

- IDLE
- RUNNING
- PAUSED
- FINISHED

remainingTime

Tipo:
number

Unidad:
segundos

completedPomodoros

Tipo:
number

## PersistentSession

sessionStartTimestamp

Tipo:
number

sessionEndTimestamp

Tipo:
number

lastSavedTimestamp

Tipo:
number
