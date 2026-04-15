import { StyleSheet, Text, View } from 'react-native';

import { AlagaColors } from '@/constants/alaga-theme';

interface SectionHeaderProps {
  title: string;
  rightLabel?: string;
}

export function SectionHeader({ title, rightLabel }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {rightLabel ? <Text style={styles.right}>{rightLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: AlagaColors.textPrimary,
  },
  right: {
    fontSize: 13,
    fontWeight: '600',
    color: AlagaColors.textMuted,
  },
});
