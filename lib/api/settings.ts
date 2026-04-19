import { supabase } from '@/lib/supabase';
import {
    DEFAULT_USER_SETTINGS,
    type LanguageOption,
    type ReminderSoundOption,
    type TextSizeOption,
    type UserSettings,
} from '@/types/settings';
import type { UserSettingsRow } from '@/types/supabase';

const SETTINGS_ROW_ID = 'default';

function normalizeDisplayName(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : DEFAULT_USER_SETTINGS.displayName;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function mapRowToSettings(row: UserSettingsRow): UserSettings {
  return {
    id: row.id,
    displayName: normalizeDisplayName(row.display_name),
    caregiverName: row.caregiver_name?.trim() ?? '',
    caregiverPhone: row.caregiver_phone?.trim() ?? '',
    textSize: row.text_size as TextSizeOption,
    reminderSound: row.reminder_sound as ReminderSoundOption,
    highContrast: row.high_contrast,
    language: row.language as LanguageOption,
  };
}

function mapSettingsToRow(settings: UserSettings): UserSettingsRow {
  return {
    id: SETTINGS_ROW_ID,
    display_name: normalizeDisplayName(settings.displayName),
    caregiver_name: normalizeOptionalText(settings.caregiverName),
    caregiver_phone: normalizeOptionalText(settings.caregiverPhone),
    text_size: settings.textSize,
    reminder_sound: settings.reminderSound,
    high_contrast: settings.highContrast,
    language: settings.language,
    updated_at: new Date().toISOString(),
  };
}

export async function getUserSettings(): Promise<UserSettings> {
  if (!supabase) {
    return DEFAULT_USER_SETTINGS;
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('id', SETTINGS_ROW_ID)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user settings:', error);
    return DEFAULT_USER_SETTINGS;
  }

  if (!data) {
    return DEFAULT_USER_SETTINGS;
  }

  return mapRowToSettings(data);
}

export async function updateUserSettings(
  next: Partial<Omit<UserSettings, 'id'>>,
): Promise<UserSettings> {
  const current = await getUserSettings();

  const merged: UserSettings = {
    ...current,
    ...next,
    id: SETTINGS_ROW_ID,
    displayName: normalizeDisplayName(next.displayName ?? current.displayName),
    caregiverName: (next.caregiverName ?? current.caregiverName).trim(),
    caregiverPhone: (next.caregiverPhone ?? current.caregiverPhone).trim(),
  };

  if (!supabase) {
    return merged;
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(mapSettingsToRow(merged), { onConflict: 'id' })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error saving user settings:', error);
    return merged;
  }

  return mapRowToSettings(data);
}