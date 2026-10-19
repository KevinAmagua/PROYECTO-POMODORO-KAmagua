---
name: android-release
description: "Configuración de build y generación de APK/AAB con EAS para Android. WHEN: preparar un release, configurar eas.json, versionar, ejecutar expo-doctor o generar el APK."
---

# Skill: Android Release

## Purpose

Preparar y generar builds Android verificables y publicables con EAS, sin editar proyectos nativos a mano.

## Cuándo usarla

- Configurar `eas.json` y perfiles.
- Generar APK (interno) o AAB (publicación).
- Diagnosticar problemas de dependencias/configuración.

## Precondiciones

- `qa` aprobado y `reviewer` con veredicto **APROBADO**.
- `npx expo lint` y `npx tsc --noEmit` en verde.

## Comandos

```bash
npx expo-doctor          # diagnóstico de dependencias y configuración
npx expo install --fix   # corrige versiones incompatibles con el SDK
npx eas-cli@latest build --platform android --profile preview   # APK de prueba
npx eas-cli@latest build --platform android --profile production # AAB de publicación
```

- Con Bun: `bunx eas-cli <command>`.

## Configuración

- Perfiles en `eas.json`: `development` (dev client), `preview` (APK interno, `distribution: internal`), `production` (AAB).
- `app.json`: `name`, `version`, `android.versionCode`, iconos, `plugins` (`expo-notifications`), permisos.
- **CNG**: no crear/editar `ios/` ni `android/` a mano; usar `app.json` y config plugins.

## Checklist de release

- [ ] `expo-doctor` sin bloqueantes.
- [ ] Lint y typecheck en verde.
- [ ] Versión y `versionCode` incrementados.
- [ ] Icono de notificación y plugin configurados.
- [ ] Permisos Android necesarios declarados.
- [ ] Build generado e **instalado/verificado** en dispositivo Android.
- [ ] Artefacto y comandos documentados.

## Reglas

- No publicar sin aprobación de `qa` + `reviewer`.
- No introducir dependencias de red o de terceros no aprobadas.
- Registrar el resultado de cada comando (evidencia).
