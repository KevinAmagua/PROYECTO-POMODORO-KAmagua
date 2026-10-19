import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton, Card, Screen, TextField } from '@/design-system/components';
import { colors, spacing, typography } from '@/design-system/tokens';
import { SETTINGS_LIMITS, type SettingsValidationErrors } from '@/features/settings/domain';
import { DEFAULT_USER_SETTINGS, USER_SETTINGS_FIELDS } from '@/features/settings/types';
import type { UserSettings, UserSettingsField } from '@/features/settings/types';
import { useSettings } from '@/hooks/use-settings';

type Draft = Record<UserSettingsField, string>;

const FIELD_COPY: Record<UserSettingsField, { label: string; hint: string }> = {
  studyDuration: { label: 'Tiempo de estudio (min)', hint: 'Minutos de concentración por pomodoro.' },
  shortBreakDuration: { label: 'Descanso corto (min)', hint: 'Minutos de descanso tras un pomodoro.' },
  longBreakDuration: { label: 'Descanso largo (min)', hint: 'Minutos de descanso al cerrar el ciclo.' },
  pomodorosPerCycle: { label: 'Pomodoros por ciclo', hint: 'Pomodoros antes del descanso largo.' },
};

function toDraft(settings: UserSettings): Draft {
  return {
    studyDuration: String(settings.studyDuration),
    shortBreakDuration: String(settings.shortBreakDuration),
    longBreakDuration: String(settings.longBreakDuration),
    pomodorosPerCycle: String(settings.pomodorosPerCycle),
  };
}

function toNumber(value: string): number {
  const trimmed = value.trim();
  return trimmed === '' ? Number.NaN : Number(trimmed);
}

function toPayload(draft: Draft): UserSettings {
  return {
    studyDuration: toNumber(draft.studyDuration),
    shortBreakDuration: toNumber(draft.shortBreakDuration),
    longBreakDuration: toNumber(draft.longBreakDuration),
    pomodorosPerCycle: toNumber(draft.pomodorosPerCycle),
  };
}

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const [draft, setDraft] = useState<Draft>(() => toDraft(settings));
  const [errors, setErrors] = useState<SettingsValidationErrors>({});
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleChange = (field: UserSettingsField, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaved(false);
    setSaveError(null);
  };

  const saveSettings = async (candidate: UserSettings): Promise<boolean> => {
    setSaveError(null);
    setSaved(false);
    try {
      const result = await updateSettings(candidate);
      if (!result.ok) {
        setErrors(result.errors);
        setSaved(false);
        return false;
      }
      setErrors({});
      setDraft(toDraft(candidate));
      setSaved(true);
      return true;
    } catch {
      setSaveError('No se pudo guardar la configuración. Inténtalo de nuevo.');
      setSaved(false);
      return false;
    }
  };

  const handleSave = () => saveSettings(toPayload(draft));

  const handleReset = async () => {
    const restored = await saveSettings(DEFAULT_USER_SETTINGS);
    if (restored) {
      setConfirmReset(false);
    }
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Ajusta la duración de cada fase. Los cambios se aplican a la siguiente fase de la sesión.
        </Text>

        <Card style={styles.fields}>
          {USER_SETTINGS_FIELDS.map((field) => {
            const limits = SETTINGS_LIMITS[field];
            return (
              <TextField
                key={field}
                label={FIELD_COPY[field].label}
                accessibilityHint={`${FIELD_COPY[field].hint} Rango válido: ${limits.min} a ${limits.max}.`}
                value={draft[field]}
                onChangeText={(value) => handleChange(field, value)}
                error={errors[field]}
              />
            );
          })}
        </Card>

        <View style={styles.actions}>
          <AppButton
            label="Guardar cambios"
            onPress={handleSave}
            accessibilityHint="Valida y guarda la configuración"
          />
          {saved ? (
            <Text accessibilityLiveRegion="polite" style={styles.saved}>
              Configuración guardada.
            </Text>
          ) : null}
          {saveError ? (
            <Text accessibilityLiveRegion="assertive" style={styles.error}>
              {saveError}
            </Text>
          ) : null}
          <AppButton
            label="Restablecer valores predeterminados"
            variant="secondary"
            onPress={() => setConfirmReset(true)}
            accessibilityHint="Solicita confirmación antes de restaurar y guardar los valores iniciales"
          />
          {confirmReset ? (
            <View style={styles.confirmation}>
              <Text style={styles.confirmationText}>
                ¿Restablecer y guardar los valores predeterminados?
              </Text>
              <AppButton
                label="Confirmar restablecimiento"
                variant="danger"
                onPress={handleReset}
              />
              <AppButton
                label="Cancelar"
                variant="secondary"
                onPress={() => setConfirmReset(false)}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  intro: {
    ...typography.body,
    color: colors.textSecondary,
  },
  fields: {
    gap: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
  },
  saved: {
    ...typography.caption,
    color: colors.success,
    textAlign: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
  },
  confirmation: {
    gap: spacing.sm,
  },
  confirmationText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
});
