import { INTERVIEW_AUDIO } from '@/constants/interview.constant';

/** Why the microphone couldn't be opened, in words for the user. */
export function microphoneErrorMessage(error: unknown): string {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Microphone access is blocked. Allow it from the icon in the address bar, then start again.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return 'No microphone was found. Connect one and start again.';
  }
  if (name === 'NotReadableError') {
    return 'Your microphone is being used by another app. Close it and start again.';
  }
  return "We couldn't open your microphone. Check it and start again.";
}

/**
 * The microphone as 16 kHz 16-bit PCM chunks (resampled in an
 * AudioWorklet), plus an analyser for the level meter.
 */
export class MicCapture {
  readonly analyser: AnalyserNode;

  private constructor(
    private readonly context: AudioContext,
    private readonly stream: MediaStream,
    private readonly worklet: AudioWorkletNode,
    analyser: AnalyserNode,
  ) {
    this.analyser = analyser;
  }

  /** Asks for the microphone; throws a DOMException when it's refused. */
  static async open(onChunk: (pcm: ArrayBuffer) => void): Promise<MicCapture> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        // The interviewer plays from the speakers: keep it out of the mic
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    const context = new AudioContext();
    try {
      await context.audioWorklet.addModule(INTERVIEW_AUDIO.workletUrl);
      const source = context.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(context, 'pcm-capture');
      worklet.port.onmessage = (event: MessageEvent<ArrayBuffer>) =>
        onChunk(event.data);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      source.connect(worklet);
      return new MicCapture(context, stream, worklet, analyser);
    } catch (error) {
      stream.getTracks().forEach((track) => track.stop());
      void context.close();
      throw error;
    }
  }

  close() {
    this.worklet.port.onmessage = null;
    this.worklet.disconnect();
    this.stream.getTracks().forEach((track) => track.stop());
    if (this.context.state !== 'closed') void this.context.close();
  }
}

/**
 * Plays the interviewer's 24 kHz PCM chunks back to back, without gaps, and
 * reports when everything queued has finished playing.
 */
export class PcmPlayer {
  readonly analyser: AnalyserNode;
  private readonly context: AudioContext;
  private readonly sources = new Set<AudioBufferSourceNode>();
  private nextStart = 0;

  /**
   * Create it in the click handler that starts the interview: browsers only
   * let audio play after a user gesture.
   */
  constructor(private readonly onIdle: () => void) {
    this.context = new AudioContext();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.connect(this.context.destination);
  }

  get playing() {
    return this.sources.size > 0;
  }

  enqueue(chunk: ArrayBuffer) {
    // 16-bit samples: an odd trailing byte can't be read
    const samples = new Int16Array(chunk, 0, chunk.byteLength >> 1);
    if (!samples.length || this.context.state === 'closed') return;
    if (this.context.state === 'suspended') void this.context.resume();

    const buffer = this.context.createBuffer(
      1,
      samples.length,
      INTERVIEW_AUDIO.outputSampleRate,
    );
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) channel[i] = samples[i]! / 32768;

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.analyser);
    // Right after the previous chunk, or now if playback had caught up
    const start = Math.max(this.context.currentTime, this.nextStart);
    source.start(start);
    this.nextStart = start + buffer.duration;
    this.sources.add(source);
    source.onended = () => {
      this.sources.delete(source);
      if (!this.sources.size) this.onIdle();
    };
  }

  /** Stops what is playing and drops the queue (the interviewer was cut off). */
  clear() {
    for (const source of this.sources) {
      source.onended = null;
      source.stop();
    }
    this.sources.clear();
    this.nextStart = 0;
  }

  close() {
    this.clear();
    if (this.context.state !== 'closed') void this.context.close();
  }
}
