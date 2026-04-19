import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CappyColors } from '@/constants/cappy-theme';
import type { Medication } from '@/types/medication';
import { StatusBadge } from './StatusBadge';

type MedicationCardVariant = 'due-now' | 'later' | 'history';

interface MedicationCardProps {
  medication: Medication;
  variant: MedicationCardVariant;
  onPress?: () => void;
}

function statusIconName(status: Medication['status']): keyof typeof Ionicons.glyphMap {
  switch (status) {
    case 'Taken':
      return 'checkmark-circle';
    case 'Snoozed':
      return 'pause-circle';
    case 'Pending':
      return 'ellipse-outline';
    case 'Missed':
      return 'close-circle';
    case 'Not Yet':
      return 'alert-circle';
    case 'Later':
      return 'time';
    default:
      return 'ellipse';
  }
}

function statusIconColor(status: Medication['status']) {
  switch (status) {
    case 'Taken':
      return CappyColors.success;
    case 'Snoozed':
      return CappyColors.accentBlue;
    case 'Pending':
      return '#667085';
    case 'Missed':
      return CappyColors.danger;
    case 'Not Yet':
      return CappyColors.warning;
    case 'Later':
      return '#4E93DA';
    default:
      return '#A8C0DC';
  }
}

function emotionLabel(emotionState?: Medication['emotionState']) {
  switch (emotionState) {
    case 'confused':
      return 'Confused';
    case 'stressed':
      return 'Stressed';
    case 'calm':
      return 'Calm';
    default:
      return null;
  }
}

function emotionBadgeStyle(emotionState?: Medication['emotionState']) {
  switch (emotionState) {
    case 'confused':
      return { backgroundColor: CappyColors.warningBg, color: CappyColors.warning };
    case 'stressed':
      return { backgroundColor: CappyColors.dangerBg, color: CappyColors.danger };
    default:
      return { backgroundColor: CappyColors.successBg, color: CappyColors.success };
  }
}

export function MedicationCard({ medication, variant, onPress }: MedicationCardProps) {
  const displayEmotion = emotionLabel(medication.emotionState);

  if (variant === 'due-now') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.dueCard, pressed && styles.pressed, !onPress && styles.notInteractive]}>
        <Image source={{ uri: medication.image }} style={styles.dueImage} contentFit="cover" />
        <View style={styles.mainTextWrap}>
          <Text style={styles.time}>{medication.time}</Text>
          <Text style={styles.dueTitle}>{medication.name}</Text>
          <Text style={styles.subtitle}>{medication.dosage}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#A8C0DC" />
      </Pressable>
    );
  }

  if (variant === 'later') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.laterCard, pressed && styles.pressed, !onPress && styles.notInteractive]}>
        <Image source={{ uri: medication.image }} style={styles.smallImage} contentFit="cover" />
        <View style={styles.mainTextWrap}>
          <Text style={styles.timeSmall}>{medication.time}</Text>
          <Text style={styles.laterTitle}>{medication.name}</Text>
          <Text style={styles.subtitleMuted}>{medication.dosage}</Text>
        </View>
        <View style={styles.rightInline}>
          <StatusBadge status={medication.status} />
          <Ionicons name="chevron-forward" size={16} color="#BDB5AA" />
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.historyCard}>
      <Image source={{ uri: medication.image }} style={styles.smallImage} contentFit="cover" />
      <View style={styles.mainTextWrap}>
        <Text style={styles.historyTitle}>{medication.name}</Text>
        <Text style={styles.time}>{medication.time}</Text>
        <Text style={styles.subtitleMuted}>{medication.dosage}</Text>
        {displayEmotion ? (
          <View style={[styles.emotionBadge, { backgroundColor: emotionBadgeStyle(medication.emotionState).backgroundColor }]}>
            <Text style={[styles.emotionText, { color: emotionBadgeStyle(medication.emotionState).color }]}>Mood: {displayEmotion}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.rightStack}>
        <Ionicons name={statusIconName(medication.status)} size={22} color={statusIconColor(medication.status)} />
        <StatusBadge status={medication.status} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: CappyColors.surface,
    borderWidth: 1.5,
    borderColor: '#E0ECF9',
    padding: 14,
    shadowColor: '#3B7EC8',
    shadowOpacity: 0.11,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 14,
    elevation: 2,
  },
  laterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: CappyColors.surface,
    borderWidth: 1,
    borderColor: '#EDE8E1',
    padding: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 8,
    elevation: 1,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: CappyColors.surface,
    borderWidth: 1,
    borderColor: '#EDE8E1',
    padding: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 8,
    elevation: 1,
  },
  dueImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: '#DCEDFB',
    backgroundColor: '#F0F6FF',
  },
  smallImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#EBF3FB',
    backgroundColor: '#F0F6FF',
  },
  mainTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  rightInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rightStack: {
    alignItems: 'center',
    gap: 5,
  },
  time: {
    color: CappyColors.accentBlue,
    fontSize: 14,
    fontWeight: '700',
  },
  timeSmall: {
    color: CappyColors.accentBlue,
    fontSize: 13,
    fontWeight: '700',
  },
  dueTitle: {
    color: CappyColors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  laterTitle: {
    color: CappyColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  historyTitle: {
    color: CappyColors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: CappyColors.textSecondary,
    fontSize: 14,
  },
  subtitleMuted: {
    color: CappyColors.textMuted,
    fontSize: 13,
  },
  emotionBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(26,58,107,0.08)',
  },
  emotionText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  notInteractive: {
    opacity: 1,
  },
});
