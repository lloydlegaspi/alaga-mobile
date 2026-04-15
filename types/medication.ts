export type MedStatus = 'Due Now' | 'Later' | 'Taken' | 'Not Yet' | 'Missed';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  indication: string;
  status: MedStatus;
  image: string;
}

export interface DayHistoryGroup {
  id: string;
  label: string;
  medications: Medication[];
}
