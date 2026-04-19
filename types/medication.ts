import type { EmotionSource, EmotionState } from './supabase';

export type MedStatus = 'Due Now' | 'Later' | 'Taken' | 'Snoozed' | 'Pending' | 'Not Yet' | 'Missed';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  purpose?: string | null;
  frequency?: string | null;
  time: string;
  indication: string;
  status: MedStatus;
  image: string;
  pillPhotoUrl?: string | null;
  emotionState?: EmotionState;
  emotionSource?: EmotionSource;
  ruleTrigger?: string | null;
  dwellTimeSeconds?: number | null;
  snoozeCount?: number | null;
  pillPhotoOpenCount?: number | null;
}

export interface DayHistoryGroup {
  id: string;
  label: string;
  medications: Medication[];
}
