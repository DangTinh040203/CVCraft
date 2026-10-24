/* global AudioWorkletProcessor, registerProcessor, sampleRate */
/**
 * Microphone capture for the mock interview, off the main thread: resamples
 * the device rate (`sampleRate`, often 48 kHz) to 16 kHz, converts to 16-bit
 * PCM and posts ~250 ms chunks (an ArrayBuffer, transferred).
 */
const TARGET_RATE = 16000;
const CHUNK_SAMPLES = 4000;

class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.step = sampleRate / TARGET_RATE;
    // Position of the next output sample in the incoming stream; carried
    // across blocks so resampling is seamless
    this.position = 0;
    this.previous = 0;
    this.chunk = new Int16Array(CHUNK_SAMPLES);
    this.length = 0;
  }

  process(inputs) {
    const input = inputs[0] && inputs[0][0];
    if (!input) return true;

    while (this.position < input.length) {
      const index = Math.floor(this.position);
      const fraction = this.position - index;
      const before = index === 0 ? this.previous : input[index - 1];
      const at = input[index];
      // Linear interpolation between the samples around the position
      const sample = Math.max(
        -1,
        Math.min(1, before + (at - before) * fraction),
      );
      this.chunk[this.length++] =
        sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      if (this.length === CHUNK_SAMPLES) {
        this.port.postMessage(this.chunk.buffer, [this.chunk.buffer]);
        this.chunk = new Int16Array(CHUNK_SAMPLES);
        this.length = 0;
      }
      this.position += this.step;
    }
    this.position -= input.length;
    this.previous = input[input.length - 1];
    return true;
  }
}

registerProcessor('pcm-capture', PcmCaptureProcessor);
