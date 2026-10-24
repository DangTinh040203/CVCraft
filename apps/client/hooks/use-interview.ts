'use client';

import { useSession } from '@clerk/nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';

import { INTERVIEW_AUDIO } from '@/constants/interview.constant';
import { useService } from '@/hooks/use-http';
import { InterviewService } from '@/services/interview.service';
import {
  connectInterviewSocket,
  type InterviewSocket,
} from '@/services/interview-socket.service';
import { resumeSelector } from '@/stores/features/resume.slice';
import { useAppSelector } from '@/stores/store';
import {
  type InterviewFeedback,
  type InterviewPhase,
  type InterviewQuota,
  type InterviewSettings,
} from '@/types/interview.type';
import {
  MicCapture,
  microphoneErrorMessage,
  PcmPlayer,
} from '@/utils/interview-audio';

export type InterviewSpeaker = 'interviewer' | 'candidate';

/**
 * A voice mock interview: opens the microphone, streams it to the server
 * while it's the candidate's turn, plays the interviewer, and ends with the
 * evaluation. Half-duplex on purpose: the mic is closed while the
 * interviewer speaks (and briefly after), or the speakers' echo would be
 * taken for the candidate cutting in.
 */
export function useInterview() {
  const { session } = useSession();
  const { resume } = useAppSelector(resumeSelector);
  const interviewService = useService(InterviewService);

  const [phase, setPhase] = useState<InterviewPhase>('setup');
  const [error, setError] = useState<string | null>(null);
  const [quota, setQuota] = useState<InterviewQuota | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [caption, setCaption] = useState<string | null>(null);
  const [speaker, setSpeaker] = useState<InterviewSpeaker>('interviewer');
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [stopping, setStopping] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [analysers, setAnalysers] = useState<{
    mic: AnalyserNode | null;
    interviewer: AnalyserNode | null;
  }>({ mic: null, interviewer: null });

  const socketRef = useRef<InterviewSocket | null>(null);
  const micRef = useRef<MicCapture | null>(null);
  const playerRef = useRef<PcmPlayer | null>(null);
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Read from audio callbacks, which don't see fresh state
  const mutedRef = useRef(false);
  const interviewerSpeakingRef = useRef(true);
  /** The server finished sending the interviewer's current turn. */
  const turnDoneRef = useRef(false);

  const refreshQuota = useCallback(async () => {
    try {
      setQuota(await interviewService.getQuota());
    } catch {
      // Only informative: the server enforces the limit on start
      setQuota(null);
    }
  }, [interviewService]);

  /** Stops the clock and frees the mic, speakers and socket (idempotent). */
  const teardown = useCallback(
    ({ keepPlayback = false }: { keepPlayback?: boolean } = {}) => {
      if (clockRef.current) clearInterval(clockRef.current);
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
      clockRef.current = null;
      cooldownRef.current = null;
      micRef.current?.close();
      micRef.current = null;
      if (!keepPlayback) {
        playerRef.current?.close();
        playerRef.current = null;
        socketRef.current?.removeAllListeners();
        socketRef.current?.disconnect();
        socketRef.current = null;
      }
      setAnalysers((current) => ({
        mic: null,
        interviewer: keepPlayback ? current.interviewer : null,
      }));
    },
    [],
  );

  const fail = useCallback(
    (message: string) => {
      teardown();
      setStopping(false);
      setError(message);
      setPhase('setup');
      void refreshQuota();
    },
    [teardown, refreshQuota],
  );

  /**
   * Gives the floor to the candidate once the interviewer's turn is both
   * complete on the server and done playing, after a short echo cooldown.
   * Then the server starts its silence countdown.
   */
  const handBackIfDone = useCallback(() => {
    const player = playerRef.current;
    if (
      !interviewerSpeakingRef.current ||
      !turnDoneRef.current ||
      player?.playing ||
      cooldownRef.current
    ) {
      return;
    }
    cooldownRef.current = setTimeout(() => {
      cooldownRef.current = null;
      // More audio may have arrived during the cooldown
      if (playerRef.current?.playing || !turnDoneRef.current) return;
      interviewerSpeakingRef.current = false;
      setSpeaker('candidate');
      socketRef.current?.emit('interview:playback-complete');
    }, INTERVIEW_AUDIO.echoCooldownMs);
  }, []);

  const start = useCallback(
    async (settings: InterviewSettings) => {
      if (!resume || !session) return;
      setError(null);
      setFeedback(null);
      setCaption(null);
      setMuted(false);
      mutedRef.current = false;
      setStopping(false);
      setElapsed(0);
      setProgress({ current: 0, total: settings.questionCount });
      setSpeaker('interviewer');
      interviewerSpeakingRef.current = true;
      turnDoneRef.current = false;
      setPhase('connecting');

      // Created before any await: audio may only start from a user gesture
      const player = new PcmPlayer(handBackIfDone);
      playerRef.current = player;

      try {
        micRef.current = await MicCapture.open((chunk) => {
          const socket = socketRef.current;
          if (mutedRef.current || interviewerSpeakingRef.current) return;
          if (socket?.connected) socket.emit('interview:audio', chunk);
        });
      } catch (micError) {
        fail(microphoneErrorMessage(micError));
        return;
      }
      setAnalysers({
        mic: micRef.current.analyser,
        interviewer: player.analyser,
      });

      const socket = connectInterviewSocket(() => session.getToken());
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('interview:start', { ...settings, resume });
      });
      socket.on('connect_error', (connectError) => {
        fail(
          connectError.message === 'Unauthorized'
            ? 'Your session has expired. Refresh the page and try again.'
            : connectError.message.includes('account')
              ? connectError.message
              : "We couldn't reach the interview server. Check your connection and try again.",
        );
      });
      socket.on('disconnect', (reason) => {
        // Ours (teardown) or after the result: nothing to report
        if (reason !== 'io client disconnect') {
          fail('The connection was lost, so the interview ended.');
        }
      });

      socket.on('interview:started', ({ totalQuestions }) => {
        setProgress({ current: 1, total: totalQuestions });
        setPhase('live');
        clockRef.current = setInterval(
          () => setElapsed((seconds) => seconds + 1),
          1000,
        );
      });
      socket.on('interview:audio', (chunk) => {
        if (!interviewerSpeakingRef.current || turnDoneRef.current) {
          // A new interviewer turn (an answer was heard, or a reminder)
          interviewerSpeakingRef.current = true;
          turnDoneRef.current = false;
          setSpeaker('interviewer');
        }
        player.enqueue(chunk);
      });
      socket.on('interview:turn-complete', (turn) => {
        setProgress({
          current: turn.questionNumber,
          total: turn.totalQuestions,
        });
        if (turn.interviewerText) setCaption(turn.interviewerText);
        turnDoneRef.current = true;
        handBackIfDone();
      });
      socket.on('interview:caption', ({ text }) => {
        if (text) setCaption(text);
      });
      socket.on('interview:interrupted', () => {
        player.clear();
        turnDoneRef.current = true;
        handBackIfDone();
      });
      socket.on('interview:evaluating', () => {
        // The closing words may still be playing: keep the speakers
        teardown({ keepPlayback: true });
        setPhase('evaluating');
      });
      socket.on('interview:feedback', (result) => {
        teardown();
        setFeedback(result);
        setPhase('result');
        void refreshQuota();
      });
      socket.on('interview:session-lost', ({ message }) => fail(message));
      socket.on('interview:error', ({ message }) => fail(message));
    },
    [resume, session, handBackIfDone, fail, teardown, refreshQuota],
  );

  /** Ends early; the answers so far are evaluated. */
  const stop = useCallback(() => {
    setStopping(true);
    socketRef.current?.emit('interview:stop');
  }, []);

  /** Leaves without a result (closing the panel mid-interview). */
  const cancel = useCallback(() => {
    teardown();
    setPhase('setup');
    void refreshQuota();
  }, [teardown, refreshQuota]);

  /** Back to the setup, keeping its settings. */
  const reset = useCallback(() => {
    teardown();
    setFeedback(null);
    setError(null);
    setPhase('setup');
  }, [teardown]);

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
  }, []);

  useEffect(() => () => teardown(), [teardown]);

  return {
    phase,
    error,
    dismissError: () => setError(null),
    quota,
    refreshQuota,
    canStart: !!resume && !!session,
    progress,
    caption,
    speaker,
    muted,
    elapsed,
    stopping,
    feedback,
    analysers,
    start,
    stop,
    cancel,
    reset,
    toggleMute,
  };
}

export type UseInterview = ReturnType<typeof useInterview>;
