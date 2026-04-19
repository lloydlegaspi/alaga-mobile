import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmotionCheckIn } from '@/components/alaga/EmotionCheckIn';
import { useFeedback } from '@/components/alaga/FeedbackToast';
import { ScreenContainer } from '@/components/alaga/ScreenContainer';
import { ScreenHeader } from '@/components/alaga/ScreenHeader';
import { AlagaColors } from '@/constants/alaga-theme';
import { useEmotionInference } from '@/hooks/useEmotionInference';
import { getMedicationById } from '@/lib/api/medications';
import { createReminderEvent, getLatestReminderEventForMedication } from '@/lib/api/reminderEvents';
import { getUserSettings } from '@/lib/api/settings';
import type { Medication } from '@/types/medication';

type ReminderDecisionState = 'idle' | 'taken' | 'snoozed';

export default function ReminderScreen() {
  const router = useRouter();
  const { showToast } = useFeedback();
  const params = useLocalSearchParams<{ medId?: string }>();
  const medId = typeof params.medId === 'string' ? params.medId : undefined;

  const [medication, setMedication] = useState<Medication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [decisionState, setDecisionState] = useState<ReminderDecisionState>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [initialSnoozeCount, setInitialSnoozeCount] = useState(0);
  const [initialPillPhotoOpenCount, setInitialPillPhotoOpenCount] = useState(0);

  const {
    emotionState,
    selfReportEmotion,
    reportSelfEmotion,
    recordSnooze,
    recordPillPhotoOpen,
    recordTake,
    recordUndo,
    markDecisionEnded,
    resumeDecision,
    getMetadataSnapshot,
  } = useEmotionInference({
    initialSnoozeCount,
    initialPillPhotoOpenCount,
  });

  const isConfused = emotionState === 'confused';
  const isStressed = emotionState === 'stressed';
  const hasDecision = decisionState !== 'idle';

  useEffect(() => {
    let isActive = true;

    async function loadMedication() {
      setIsLoading(true);
      const [record, latestEvent] = await Promise.all([
        getMedicationById(medId),
        getLatestReminderEventForMedication(medId),
      ]);

      if (isActive) {
        setMedication(record);
        setInitialSnoozeCount(latestEvent?.snooze_count ?? 0);
        setInitialPillPhotoOpenCount(latestEvent?.pill_photo_open_count ?? 0);

        const nextDecisionState: ReminderDecisionState =
          record?.status === 'Taken'
            ? 'taken'
            : latestEvent?.action === 'snoozed'
              ? 'snoozed'
              : 'idle';

        setDecisionState(nextDecisionState);
        setIsLoading(false);
      }
    }

    void loadMedication();

    return () => {
      isActive = false;
    };
  }, [medId]);

  const onTakeNow = async () => {
    if (!medication || isSubmitting) return;

    recordTake();
    setIsSubmitting(true);
    const metadata = getMetadataSnapshot();

    const event = await createReminderEvent({
      medicationId: medication.id,
      scheduledFor: new Date().toISOString(),
      action: 'taken',
      ...metadata,
    });

    if (!event) {
      resumeDecision();
      showToast('Could not mark as taken', 'error');
      Alert.alert('Action failed', 'Could not record this reminder action.');
      setIsSubmitting(false);
      return;
    }

    setDecisionState('taken');
    showToast('Marked as taken', 'success');
    setIsSubmitting(false);
  };

  const onSnooze = async () => {
    if (!medication || isSubmitting) return;

    recordSnooze();
    markDecisionEnded();
    setIsSubmitting(true);
    const metadata = getMetadataSnapshot();

    const event = await createReminderEvent({
      medicationId: medication.id,
      scheduledFor: new Date().toISOString(),
      action: 'snoozed',
      ...metadata,
    });

    if (!event) {
      resumeDecision();
      showToast('Could not snooze reminder', 'error');
      Alert.alert('Action failed', 'Could not snooze this reminder.');
      setIsSubmitting(false);
      return;
    }

    setDecisionState('snoozed');
    showToast('Reminder snoozed', 'success');
    setIsSubmitting(false);
  };

  const onUndoAction = () => {
    if (decisionState === 'taken') {
      recordUndo();
    } else {
      resumeDecision();
    }

    setDecisionState('idle');
    showToast('Action undone', 'success');
  };

  const onOpenPhoto = () => {
    recordPillPhotoOpen();
    setIsPhotoModalVisible(true);
  };

  const onCallCaregiver = async () => {
    const settings = await getUserSettings();
    const caregiverName = settings.caregiverName.trim();
    const caregiverPhone = settings.caregiverPhone.trim();

    if (!caregiverName && !caregiverPhone) {
      Alert.alert(
        'Call caregiver/help',
        'No caregiver contact saved yet. Add one in Settings first.',
      );
      return;
    }

    const contactTitle = caregiverName || 'Caregiver';
    const contactLines = caregiverPhone
      ? `${contactTitle}\n${caregiverPhone}`
      : contactTitle;

    Alert.alert(
      'Caregiver contact',
      `${contactLines}\n\nCalling is not connected yet in this build.`,
    );
  };

  const editMedication = () => {
    if (!medication) return;
    router.push({
      pathname: '/(tabs)/add',
      params: { medId: medication.id },
    });
  };

  const helperText = isStressed
    ? 'You are doing okay. Let us take this one step at a time.'
    : 'Take your medicine now, or snooze to be reminded again shortly.';

  const recordedTitle = decisionState === 'taken' ? 'Recorded' : 'Snoozed';
  const recordedSubtitle =
    decisionState === 'taken'
      ? 'Great job taking your medication.'
      : 'Reminder moved by 10 minutes.';

  if (isLoading || !medication) {
    return (
      <ScreenContainer>
        <ScreenHeader onBack={() => router.back()} backLabel="Back" />
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading reminder...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader onBack={() => router.back()} backLabel="Back" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Medication Reminder</Text>
          <Text style={styles.time}>{medication.time}</Text>
        </View>

        <View style={[styles.card, isConfused && styles.cardConfused]}>
          <Pressable style={styles.imagePressable} onPress={onOpenPhoto}>
            <Image
              source={{ uri: medication.image }}
              style={[styles.image, isConfused && styles.imageConfused]}
              contentFit="cover"
            />
            <View style={[styles.photoHintChip, isConfused && styles.photoHintChipConfused]}>
              <Ionicons name="scan-outline" size={14} color={isConfused ? '#FFFFFF' : AlagaColors.accentBlue} />
              <Text style={[styles.photoHintText, isConfused && styles.photoHintTextConfused]}>Tap photo to zoom</Text>
            </View>
          </Pressable>

          <View style={styles.details}>
            <Text style={[styles.detailTime, isConfused && styles.detailTimeConfused]}>{medication.time}</Text>
            <Text style={[styles.name, isConfused && styles.nameConfused]}>{medication.name}</Text>
            <Text style={[styles.dosage, isConfused && styles.dosageConfused]}>{medication.dosage}</Text>
            {!isConfused ? <Text style={styles.indication}>{medication.indication}</Text> : null}
          </View>
        </View>

        <EmotionCheckIn value={selfReportEmotion} onSelect={reportSelfEmotion} disabled={isSubmitting} />

        {isConfused ? (
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>Take {medication.dosage} now</Text>
            <Text style={styles.instructionText}>One step at a time. You can do this.</Text>
          </View>
        ) : (
          <Text style={styles.helperText}>{helperText}</Text>
        )}

        {!isConfused && !isStressed ? (
          <Pressable style={styles.editButton} onPress={editMedication}>
            <Ionicons name="create-outline" size={18} color={AlagaColors.accentBlue} />
            <Text style={styles.editButtonText}>Edit Medication</Text>
          </Pressable>
        ) : null}

        {!hasDecision ? (
          isStressed ? (
            <View style={styles.actionWrap}>
              <Pressable style={[styles.snoozeButton, styles.snoozePriorityButton]} onPress={onSnooze} disabled={isSubmitting}>
                <Ionicons name="notifications-off-outline" size={22} color="#FFFFFF" />
                <Text style={styles.snoozePriorityText}>{isSubmitting ? 'Recording...' : 'Snooze 10 min'}</Text>
              </Pressable>

              <Pressable style={styles.helpButton} onPress={onCallCaregiver} disabled={isSubmitting}>
                <Ionicons name="call-outline" size={20} color={AlagaColors.accentBlue} />
                <Text style={styles.helpButtonText}>Call caregiver/help</Text>
              </Pressable>

              <Pressable style={styles.takeSecondaryButton} onPress={onTakeNow} disabled={isSubmitting}>
                <Text style={styles.takeSecondaryText}>{isSubmitting ? 'Recording...' : 'I took it now'}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.actionWrap}>
              <Pressable
                style={[styles.takeButton, isConfused && styles.takeButtonConfused]}
                onPress={onTakeNow}
                disabled={isSubmitting}>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                <Text style={[styles.takeButtonText, isConfused && styles.takeButtonTextConfused]}>
                  {isSubmitting ? 'Recording...' : 'Take Now'}
                </Text>
              </Pressable>

              <Pressable style={styles.snoozeButton} onPress={onSnooze} disabled={isSubmitting}>
                <Ionicons name="notifications-off-outline" size={20} color="#8A9BBB" />
                <Text style={styles.snoozeText}>Snooze 10 min</Text>
              </Pressable>
            </View>
          )
        ) : (
          <View style={styles.actionWrap}>
            <View style={[styles.recordedCard, decisionState === 'snoozed' && styles.recordedCardSnoozed]}>
              <Text style={[styles.recordedTitle, decisionState === 'snoozed' && styles.recordedTitleSnoozed]}>{recordedTitle}</Text>
              <Text style={[styles.recordedSubtitle, decisionState === 'snoozed' && styles.recordedSubtitleSnoozed]}>{recordedSubtitle}</Text>
            </View>

            <Pressable style={styles.snoozeButton} onPress={onUndoAction}>
              <Ionicons name="arrow-undo-outline" size={19} color="#8A9BBB" />
              <Text style={styles.snoozeText}>Undo</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isPhotoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPhotoModalVisible(false)}>
        <Pressable style={styles.photoModalBackdrop} onPress={() => setIsPhotoModalVisible(false)}>
          <View style={styles.photoModalCard}>
            <Image source={{ uri: medication.image }} style={styles.photoModalImage} contentFit="contain" />
            <Text style={styles.photoModalHint}>Tap anywhere to close</Text>
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 24,
  },
  titleWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    color: AlagaColors.textMuted,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  time: {
    color: AlagaColors.accentBlue,
    fontSize: 24,
    fontWeight: '800',
  },
  card: {
    borderRadius: 24,
    backgroundColor: AlagaColors.surface,
    borderWidth: 1,
    borderColor: '#E8EEF8',
    overflow: 'hidden',
    shadowColor: '#3B7EC8',
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 28,
    elevation: 2,
    marginBottom: 16,
  },
  cardConfused: {
    borderWidth: 2,
    borderColor: '#8EB7EA',
  },
  imagePressable: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 170,
    backgroundColor: '#F0F6FF',
  },
  imageConfused: {
    height: 196,
    borderBottomWidth: 3,
    borderBottomColor: '#8EB7EA',
  },
  photoHintChip: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 99,
    backgroundColor: '#FFFFFFF0',
    borderWidth: 1,
    borderColor: '#D8E6F4',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  photoHintChipConfused: {
    backgroundColor: '#3B7EC8',
    borderColor: '#3B7EC8',
  },
  photoHintText: {
    color: AlagaColors.accentBlue,
    fontSize: 12,
    fontWeight: '700',
  },
  photoHintTextConfused: {
    color: '#FFFFFF',
  },
  details: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  detailTime: {
    color: AlagaColors.accentBlue,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailTimeConfused: {
    fontSize: 16,
  },
  name: {
    color: AlagaColors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 6,
  },
  nameConfused: {
    fontSize: 34,
    lineHeight: 39,
  },
  dosage: {
    color: '#4A5568',
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 4,
  },
  dosageConfused: {
    fontSize: 24,
    marginBottom: 0,
  },
  indication: {
    color: AlagaColors.textMuted,
    fontSize: 15,
  },
  instructionCard: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#8EB7EA',
    backgroundColor: '#EBF3FB',
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 14,
  },
  instructionTitle: {
    color: AlagaColors.textPrimary,
    fontSize: 25,
    fontWeight: '800',
    marginBottom: 4,
  },
  instructionText: {
    color: '#4F6D92',
    fontSize: 15,
    fontWeight: '600',
  },
  helperText: {
    color: AlagaColors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 6,
  },
  editButton: {
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8E6F4',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  editButtonText: {
    color: AlagaColors.accentBlue,
    fontSize: 15,
    fontWeight: '700',
  },
  actionWrap: {
    gap: 12,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: AlagaColors.textMuted,
    fontSize: 15,
  },
  takeButton: {
    minHeight: 66,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#38A169',
    flexDirection: 'row',
    gap: 8,
  },
  takeButtonConfused: {
    minHeight: 74,
    borderRadius: 24,
  },
  takeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  takeButtonTextConfused: {
    fontSize: 23,
  },
  snoozeButton: {
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: AlagaColors.borderBlue,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  snoozeText: {
    color: '#8A9BBB',
    fontSize: 18,
    fontWeight: '600',
  },
  snoozePriorityButton: {
    backgroundColor: '#3B7EC8',
    borderColor: '#3B7EC8',
    minHeight: 66,
  },
  snoozePriorityText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
  },
  helpButton: {
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D8E6F4',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  helpButtonText: {
    color: AlagaColors.accentBlue,
    fontSize: 18,
    fontWeight: '700',
  },
  takeSecondaryButton: {
    minHeight: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8E6F4',
    backgroundColor: '#F8FBFF',
  },
  takeSecondaryText: {
    color: '#4F6D92',
    fontSize: 17,
    fontWeight: '700',
  },
  recordedCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
    minHeight: 84,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordedCardSnoozed: {
    borderColor: '#8EB7EA',
    backgroundColor: '#EBF3FB',
  },
  recordedTitle: {
    color: '#22C55E',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  recordedTitleSnoozed: {
    color: '#3B7EC8',
  },
  recordedSubtitle: {
    color: '#86EFAC',
    fontSize: 13,
  },
  recordedSubtitleSnoozed: {
    color: '#5D84B6',
  },
  photoModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(13, 29, 53, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  photoModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E6F4',
    padding: 12,
  },
  photoModalImage: {
    width: '100%',
    height: 290,
    borderRadius: 14,
    backgroundColor: '#F0F6FF',
  },
  photoModalHint: {
    marginTop: 10,
    color: AlagaColors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
