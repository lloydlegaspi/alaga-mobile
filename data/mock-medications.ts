import type { DayHistoryGroup, Medication } from '@/types/medication';

const pillImages = {
  amlodipine: 'https://images.unsplash.com/photo-1740592756330-adb8c1f5fbe7?w=500&h=500&fit=crop',
  metformin: 'https://images.unsplash.com/photo-1549477880-6703139139c5?w=500&h=500&fit=crop',
  calcium: 'https://images.unsplash.com/photo-1659019479940-e3fd3fba24d8?w=500&h=500&fit=crop',
  vitaminD: 'https://images.unsplash.com/photo-1565071783280-719b01b29912?w=500&h=500&fit=crop',
};

export const todayDateLabel = 'Monday, April 13';

export const todayMedications: Medication[] = [
  {
    id: '1',
    name: 'Amlodipine',
    dosage: '1 tablet',
    time: '8:00 AM',
    indication: 'For high blood pressure',
    status: 'Due Now',
    image: pillImages.amlodipine,
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '1 tablet',
    time: '8:00 AM',
    indication: 'For diabetes',
    status: 'Due Now',
    image: pillImages.metformin,
  },
  {
    id: '3',
    name: 'Calcium',
    dosage: '1 capsule',
    time: '1:00 PM',
    indication: 'For bone health',
    status: 'Later',
    image: pillImages.calcium,
  },
  {
    id: '4',
    name: 'Vitamin D',
    dosage: '1 capsule',
    time: '7:00 PM',
    indication: 'For bone and immune health',
    status: 'Later',
    image: pillImages.vitaminD,
  },
];

export const historyToday: Medication[] = [
  { ...todayMedications[0], status: 'Taken' },
  { ...todayMedications[1], status: 'Taken' },
  { ...todayMedications[2], status: 'Not Yet' },
  { ...todayMedications[3], status: 'Later' },
];

export const historyYesterday: Medication[] = [
  { ...todayMedications[0], id: 'y-1', status: 'Taken' },
  { ...todayMedications[1], id: 'y-2', status: 'Missed' },
  { ...todayMedications[2], id: 'y-3', status: 'Taken' },
  { ...todayMedications[3], id: 'y-4', status: 'Taken' },
];

export const last7DaysHistory: DayHistoryGroup[] = [
  {
    id: 'today',
    label: 'Today - Mon, Apr 13',
    medications: historyToday,
  },
  {
    id: 'yesterday',
    label: 'Yesterday - Sun, Apr 12',
    medications: historyYesterday,
  },
  {
    id: 'apr11',
    label: 'Sat, Apr 11',
    medications: [
      { ...todayMedications[0], id: 'd11-1', status: 'Taken' },
      { ...todayMedications[1], id: 'd11-2', status: 'Taken' },
      { ...todayMedications[2], id: 'd11-3', status: 'Taken' },
      { ...todayMedications[3], id: 'd11-4', status: 'Taken' },
    ],
  },
  {
    id: 'apr10',
    label: 'Fri, Apr 10',
    medications: [
      { ...todayMedications[0], id: 'd10-1', status: 'Taken' },
      { ...todayMedications[1], id: 'd10-2', status: 'Missed' },
      { ...todayMedications[2], id: 'd10-3', status: 'Taken' },
      { ...todayMedications[3], id: 'd10-4', status: 'Taken' },
    ],
  },
  {
    id: 'apr9',
    label: 'Thu, Apr 9',
    medications: [
      { ...todayMedications[0], id: 'd9-1', status: 'Taken' },
      { ...todayMedications[1], id: 'd9-2', status: 'Taken' },
      { ...todayMedications[2], id: 'd9-3', status: 'Taken' },
      { ...todayMedications[3], id: 'd9-4', status: 'Taken' },
    ],
  },
];

export function getMedicationById(id?: string): Medication {
  return todayMedications.find((med) => med.id === id) ?? todayMedications[0];
}
