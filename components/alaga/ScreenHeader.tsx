import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AlagaColors } from '@/constants/alaga-theme';

interface ScreenHeaderProps {
  title?: string;
  onBack?: () => void;
  backLabel?: string;
  borderColor?: string;
}

export function ScreenHeader({
  title,
  onBack,
  backLabel = 'Back',
  borderColor = AlagaColors.border,
}: ScreenHeaderProps) {
  return (
    <View style={[styles.container, { borderBottomColor: borderColor }]}> 
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={AlagaColors.accentBlue} />
          <Text style={styles.backText}>{backLabel}</Text>
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}

      {title ? <Text style={styles.title}>{title}</Text> : <View style={styles.titleSpacer} />}

      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 58,
    borderBottomWidth: 1,
    backgroundColor: AlagaColors.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  backText: {
    color: AlagaColors.accentBlue,
    fontSize: 17,
    fontWeight: '600',
  },
  title: {
    color: AlagaColors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  placeholder: {
    minWidth: 44,
  },
  titleSpacer: {
    flex: 1,
  },
});
