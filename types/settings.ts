export const TEXT_SIZE_OPTIONS = ['Standard', 'Large'] as const;
export const REMINDER_SOUND_OPTIONS = ['On', 'Off'] as const;
export const LANGUAGE_OPTIONS = ['English', 'Filipino'] as const;

export type TextSizeOption = (typeof TEXT_SIZE_OPTIONS)[number];
export type ReminderSoundOption = (typeof REMINDER_SOUND_OPTIONS)[number];
export type LanguageOption = (typeof LANGUAGE_OPTIONS)[number];

export interface UserSettings {
  id: string;
  displayName: string;
  caregiverName: string;
  caregiverPhone: string;
  textSize: TextSizeOption;
  reminderSound: ReminderSoundOption;
  highContrast: boolean;
  language: LanguageOption;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  id: 'default',
  displayName: 'User',
  caregiverName: '',
  caregiverPhone: '',
  textSize: 'Standard',
  reminderSound: 'On',
  highContrast: false,
  language: 'English',
};