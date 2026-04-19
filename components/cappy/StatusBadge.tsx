import { StyleSheet, Text, View } from 'react-native';

import { CappyColors } from '@/constants/cappy-theme';
import type { MedStatus } from '@/types/medication';

const STATUS_STYLES: Record<MedStatus, { backgroundColor: string; color: string }> = {
  'Due Now': { backgroundColor: CappyColors.accentBlue, color: '#FFFFFF' },
  Later: { backgroundColor: CappyColors.accentBlueSoft, color: CappyColors.accentBlue },
  Taken: { backgroundColor: CappyColors.successBg, color: CappyColors.success },
  Snoozed: { backgroundColor: CappyColors.accentBlueSoft, color: CappyColors.accentBlue },
  Pending: { backgroundColor: '#EEF2F7', color: '#667085' },
  'Not Yet': { backgroundColor: CappyColors.warningBg, color: CappyColors.warning },
  Missed: { backgroundColor: CappyColors.dangerBg, color: CappyColors.danger },
};

interface StatusBadgeProps {
  status: MedStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.text, { color: style.color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(26,58,107,0.08)',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
