import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AlagaColors } from '@/constants/alaga-theme';
import type { EmotionState } from '@/types/supabase';

interface EmotionCheckInProps {
  value: EmotionState | null;
  onSelect: (emotion: EmotionState) => void;
  disabled?: boolean;
}

const OPTIONS: { key: EmotionState; label: string }[] = [
  { key: 'calm', label: 'Calm' },
  { key: 'confused', label: 'Confused' },
  { key: 'stressed', label: 'Stressed' },
];

export function EmotionCheckIn({ value, onSelect, disabled = false }: EmotionCheckInProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>How are you feeling right now?</Text>
      <View style={styles.optionsWrap}>
        {OPTIONS.map((option) => {
          const isSelected = value === option.key;

          return (
            <Pressable
              key={option.key}
              onPress={() => onSelect(option.key)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.optionButton,
                isSelected && styles.optionButtonSelected,
                pressed && !disabled && styles.optionButtonPressed,
                disabled && styles.optionButtonDisabled,
              ]}>
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8E6F4',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
  },
  title: {
    color: AlagaColors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  optionsWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E3ECF7',
    backgroundColor: '#F8FBFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  optionButtonSelected: {
    borderColor: AlagaColors.accentBlue,
    backgroundColor: '#EAF3FE',
  },
  optionButtonPressed: {
    opacity: 0.9,
  },
  optionButtonDisabled: {
    opacity: 0.55,
  },
  optionText: {
    color: '#4F6D92',
    fontSize: 15,
    fontWeight: '700',
  },
  optionTextSelected: {
    color: AlagaColors.accentBlue,
  },
});
