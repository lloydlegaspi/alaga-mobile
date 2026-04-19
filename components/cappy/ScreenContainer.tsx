import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CappyColors } from '@/constants/cappy-theme';

interface ScreenContainerProps extends PropsWithChildren {
  padded?: boolean;
  backgroundColor?: string;
}

export function ScreenContainer({
  children,
  padded = false,
  backgroundColor = CappyColors.pageBackground,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top']}>
      <View style={[styles.content, padded && styles.padded]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 20,
  },
});
