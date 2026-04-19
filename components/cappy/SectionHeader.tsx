import { StyleSheet, Text, View } from 'react-native';

import { CappyColors } from '@/constants/cappy-theme';

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
    color: CappyColors.textPrimary,
  },
  right: {
    fontSize: 13,
    fontWeight: '600',
    color: CappyColors.textMuted,
  },
});
