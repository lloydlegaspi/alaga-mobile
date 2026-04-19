import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { EmotionSource, EmotionState } from '@/types/supabase';

const EMOTION_PRIORITY: Record<EmotionState, number> = {
  calm: 0,
  confused: 1,
  stressed: 2,
};

export type EmotionRuleTrigger =
  | 'dwell_timeout'
  | 'repeated_snooze'
  | 'repeated_pill_photo_open'
  | 'take_then_undo';

type BehaviorEmotion = Extract<EmotionState, 'confused' | 'stressed'>;

interface BehaviorSignal {
  emotion: BehaviorEmotion;
  ruleTrigger: EmotionRuleTrigger;
}

interface UseEmotionInferenceOptions {
  dwellThresholdSeconds?: number;
  repeatedSnoozeThreshold?: number;
  repeatedPillPhotoOpenThreshold?: number;
  takeUndoWindowSeconds?: number;
  initialSnoozeCount?: number;
  initialPillPhotoOpenCount?: number;
}

export interface EmotionMetadataSnapshot {
  emotionState: EmotionState;
  emotionSource: EmotionSource;
  ruleTrigger: EmotionRuleTrigger | null;
  dwellTimeSeconds: number;
  snoozeCount: number;
  pillPhotoOpenCount: number;
}

interface UseEmotionInferenceResult {
  emotionState: EmotionState;
  emotionSource: EmotionSource;
  ruleTrigger: EmotionRuleTrigger | null;
  selfReportEmotion: EmotionState | null;
  snoozeCount: number;
  pillPhotoOpenCount: number;
  reportSelfEmotion: (emotion: EmotionState) => void;
  clearSelfReport: () => void;
  recordSnooze: () => number;
  recordPillPhotoOpen: () => number;
  recordTake: () => void;
  recordUndo: () => void;
  markDecisionEnded: () => void;
  resumeDecision: () => void;
  getMetadataSnapshot: () => EmotionMetadataSnapshot;
}

export function useEmotionInference(options: UseEmotionInferenceOptions = {}): UseEmotionInferenceResult {
  const {
    dwellThresholdSeconds = 15,
    repeatedSnoozeThreshold = 2,
    repeatedPillPhotoOpenThreshold = 2,
    takeUndoWindowSeconds = 20,
    initialSnoozeCount = 0,
    initialPillPhotoOpenCount = 0,
  } = options;

  const mountedAtRef = useRef(Date.now());
  const decisionEndedRef = useRef(false);
  const lastTakeAtRef = useRef<number | null>(null);
  const selfReportEmotionRef = useRef<EmotionState | null>(null);
  const behaviorSignalRef = useRef<BehaviorSignal | null>(null);
  const snoozeCountRef = useRef(initialSnoozeCount);
  const pillPhotoOpenCountRef = useRef(initialPillPhotoOpenCount);

  const [selfReportEmotion, setSelfReportEmotion] = useState<EmotionState | null>(null);
  const [behaviorSignal, setBehaviorSignal] = useState<BehaviorSignal | null>(null);
  const [snoozeCount, setSnoozeCount] = useState(initialSnoozeCount);
  const [pillPhotoOpenCount, setPillPhotoOpenCount] = useState(initialPillPhotoOpenCount);

  const getDwellTimeSeconds = useCallback(() => {
    return Math.max(0, Math.floor((Date.now() - mountedAtRef.current) / 1000));
  }, []);

  const updateBehaviorSignal = useCallback((next: BehaviorSignal) => {
    const current = behaviorSignalRef.current;
    const shouldReplace =
      !current || EMOTION_PRIORITY[next.emotion] > EMOTION_PRIORITY[current.emotion];

    if (shouldReplace) {
      behaviorSignalRef.current = next;
      setBehaviorSignal(next);
    }
  }, []);

  useEffect(() => {
    snoozeCountRef.current = initialSnoozeCount;
    setSnoozeCount(initialSnoozeCount);
  }, [initialSnoozeCount]);

  useEffect(() => {
    pillPhotoOpenCountRef.current = initialPillPhotoOpenCount;
    setPillPhotoOpenCount(initialPillPhotoOpenCount);
  }, [initialPillPhotoOpenCount]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (decisionEndedRef.current) return;
      if (selfReportEmotionRef.current) return;

      if (getDwellTimeSeconds() >= dwellThresholdSeconds) {
        updateBehaviorSignal({
          emotion: 'confused',
          ruleTrigger: 'dwell_timeout',
        });
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [dwellThresholdSeconds, getDwellTimeSeconds, updateBehaviorSignal]);

  const reportSelfEmotion = useCallback((emotion: EmotionState) => {
    selfReportEmotionRef.current = emotion;
    setSelfReportEmotion(emotion);
  }, []);

  const clearSelfReport = useCallback(() => {
    selfReportEmotionRef.current = null;
    setSelfReportEmotion(null);
  }, []);

  const markDecisionEnded = useCallback(() => {
    decisionEndedRef.current = true;
  }, []);

  const resumeDecision = useCallback(() => {
    decisionEndedRef.current = false;
  }, []);

  const recordSnooze = useCallback(() => {
    const next = snoozeCountRef.current + 1;
    snoozeCountRef.current = next;
    setSnoozeCount(next);

    if (next >= repeatedSnoozeThreshold) {
      updateBehaviorSignal({
        emotion: 'stressed',
        ruleTrigger: 'repeated_snooze',
      });
    }

    return next;
  }, [repeatedSnoozeThreshold, updateBehaviorSignal]);

  const recordPillPhotoOpen = useCallback(() => {
    const next = pillPhotoOpenCountRef.current + 1;
    pillPhotoOpenCountRef.current = next;
    setPillPhotoOpenCount(next);

    if (next >= repeatedPillPhotoOpenThreshold) {
      updateBehaviorSignal({
        emotion: 'confused',
        ruleTrigger: 'repeated_pill_photo_open',
      });
    }

    return next;
  }, [repeatedPillPhotoOpenThreshold, updateBehaviorSignal]);

  const recordTake = useCallback(() => {
    lastTakeAtRef.current = Date.now();
    markDecisionEnded();
  }, [markDecisionEnded]);

  const recordUndo = useCallback(() => {
    const lastTakeAt = lastTakeAtRef.current;
    if (lastTakeAt && Date.now() - lastTakeAt <= takeUndoWindowSeconds * 1000) {
      updateBehaviorSignal({
        emotion: 'confused',
        ruleTrigger: 'take_then_undo',
      });
    }

    decisionEndedRef.current = false;
  }, [takeUndoWindowSeconds, updateBehaviorSignal]);

  const emotionState = useMemo<EmotionState>(() => {
    return selfReportEmotion ?? behaviorSignal?.emotion ?? 'calm';
  }, [behaviorSignal?.emotion, selfReportEmotion]);

  const emotionSource = useMemo<EmotionSource>(() => {
    if (selfReportEmotion) return 'self_report';
    if (behaviorSignal) return 'behavior_rule';
    return 'none';
  }, [behaviorSignal, selfReportEmotion]);

  const ruleTrigger = useMemo<EmotionRuleTrigger | null>(() => {
    if (selfReportEmotion) return null;
    return behaviorSignal?.ruleTrigger ?? null;
  }, [behaviorSignal?.ruleTrigger, selfReportEmotion]);

  const getMetadataSnapshot = useCallback((): EmotionMetadataSnapshot => {
    const selfReport = selfReportEmotionRef.current;
    const behavior = behaviorSignalRef.current;

    const snapshotEmotionState: EmotionState = selfReport ?? behavior?.emotion ?? 'calm';
    const snapshotEmotionSource: EmotionSource = selfReport ? 'self_report' : behavior ? 'behavior_rule' : 'none';

    return {
      emotionState: snapshotEmotionState,
      emotionSource: snapshotEmotionSource,
      ruleTrigger: selfReport ? null : behavior?.ruleTrigger ?? null,
      dwellTimeSeconds: getDwellTimeSeconds(),
      snoozeCount: snoozeCountRef.current,
      pillPhotoOpenCount: pillPhotoOpenCountRef.current,
    };
  }, [getDwellTimeSeconds]);

  return {
    emotionState,
    emotionSource,
    ruleTrigger,
    selfReportEmotion,
    snoozeCount,
    pillPhotoOpenCount,
    reportSelfEmotion,
    clearSelfReport,
    recordSnooze,
    recordPillPhotoOpen,
    recordTake,
    recordUndo,
    markDecisionEnded,
    resumeDecision,
    getMetadataSnapshot,
  };
}
