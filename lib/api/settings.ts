import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAuthenticatedUserId } from '@/lib/auth/guestSession';
import { supabase } from '@/lib/supabase';
import {
    DEFAULT_USER_SETTINGS,
    type LanguageOption,
    type ReminderSoundOption,
    type TextSizeOption,
    type UserSettings,
} from '@/types/settings';
import type { UserSettingsRow } from '@/types/supabase';

const SETTINGS_CACHE_KEY_PREFIX = 'cappy:user-settings:';
const SETTINGS_CACHE_LOCAL_KEY = `${SETTINGS_CACHE_KEY_PREFIX}local`;

function getSettingsCacheKey(userId: string | null): string {
  return userId ? `${SETTINGS_CACHE_KEY_PREFIX}${userId}` : SETTINGS_CACHE_LOCAL_KEY;
}

function coerceTextSize(value: unknown): TextSizeOption {
  return value === 'Large' ? 'Large' : 'Standard';
}

function coerceReminderSound(value: unknown): ReminderSoundOption {
  return value === 'Off' ? 'Off' : 'On';
}

function coerceLanguage(value: unknown): LanguageOption {
  return value === 'Filipino' ? 'Filipino' : 'English';
}

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

function mapSettingsToRow(settings: UserSettings, userId: string): UserSettingsRow {
  const rowId = settings.id && settings.id !== 'default' ? settings.id : userId;

  return {
    id: rowId,
    user_id: userId,
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

function getDefaultSettingsForUser(userId: string | null): UserSettings {
  return {
    ...DEFAULT_USER_SETTINGS,
    id: userId ?? DEFAULT_USER_SETTINGS.id,
  };
}

function sanitizeSettingsForUser(
  value: Partial<UserSettings> | null | undefined,
  userId: string | null,
): UserSettings {
  const defaults = getDefaultSettingsForUser(userId);

  return {
    ...defaults,
    id: userId ?? defaults.id,
    displayName: normalizeDisplayName(value?.displayName ?? defaults.displayName),
    caregiverName: (value?.caregiverName ?? defaults.caregiverName).trim(),
    caregiverPhone: (value?.caregiverPhone ?? defaults.caregiverPhone).trim(),
    textSize: coerceTextSize(value?.textSize),
    reminderSound: coerceReminderSound(value?.reminderSound),
    highContrast: Boolean(value?.highContrast),
    language: coerceLanguage(value?.language),
  };
}

async function readCachedSettings(userId: string | null): Promise<UserSettings | null> {
  try {
    const cacheKey = getSettingsCacheKey(userId);
    const raw = await AsyncStorage.getItem(cacheKey);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return sanitizeSettingsForUser(parsed, userId);
  } catch (error) {
    console.error('Error reading cached user settings:', error);
    return null;
  }
}

async function writeCachedSettings(settings: UserSettings, userId: string | null): Promise<void> {
  try {
    const cacheKey = getSettingsCacheKey(userId);
    await AsyncStorage.setItem(cacheKey, JSON.stringify(settings));
  } catch (error) {
    console.error('Error writing cached user settings:', error);
  }
}

export async function getUserSettings(): Promise<UserSettings> {
  const userId = await getAuthenticatedUserId();
  const cached = await readCachedSettings(userId);

  if (!supabase) {
    return cached ?? getDefaultSettingsForUser(userId);
  }

  if (!userId) {
    return cached ?? getDefaultSettingsForUser(userId);
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user settings:', error);
    return cached ?? getDefaultSettingsForUser(userId);
  }

  if (!data) {
    return cached ?? getDefaultSettingsForUser(userId);
  }

  const mapped = mapRowToSettings(data);
  await writeCachedSettings(mapped, userId);
  return mapped;
}

export async function updateUserSettings(
  next: Partial<Omit<UserSettings, 'id'>>,
): Promise<UserSettings> {
  const userId = await getAuthenticatedUserId();

  const current = await getUserSettings();

  const merged = sanitizeSettingsForUser(
    {
      ...current,
      ...next,
    },
    userId,
  );

  if (!supabase || !userId) {
    await writeCachedSettings(merged, userId);
    return merged;
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(mapSettingsToRow(merged, userId), { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error saving user settings:', error);
    await writeCachedSettings(merged, userId);
    return merged;
  }

  const mapped = mapRowToSettings(data);
  await writeCachedSettings(mapped, userId);
  return mapped;
}