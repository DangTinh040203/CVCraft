/**
 * Shared prompt sanitizer to mitigate prompt injection attacks.
 * Filters known injection patterns across LLM formats (ChatML, Anthropic, etc.)
 * and wraps user content in delimiters to enforce data/instruction boundaries.
 */
export class PromptSanitizer {
  /**
   * Sanitize user-provided content before embedding it into an LLM prompt.
   * Strips known prompt injection markers and wraps the content in triple-quote delimiters.
   */
  static sanitize(content: string): string {
    const cleaned = content
      // OpenAI / generic system block markers
      .replace(/\[SYSTEM(?:\s+INSTRUCTION)?]/gi, '[FILTERED]')
      .replace(/\[INST]/gi, '[FILTERED]')
      .replace(/\[\/INST]/gi, '[FILTERED]')

      // Llama / Meta format
      .replace(/<<\s*SYS\s*>>/gi, '<<FILTERED>>')
      .replace(/<<\s*\/SYS\s*>>/gi, '<<FILTERED>>')
      .replace(/<\/?system>/gi, '<FILTERED>')

      // ChatML format (used by OpenAI fine-tuned, Mistral, etc.)
      .replace(/<\|im_start\|>/gi, '<FILTERED>')
      .replace(/<\|im_end\|>/gi, '<FILTERED>')
      .replace(/<\|endoftext\|>/gi, '<FILTERED>')

      // Anthropic format
      .replace(/###\s*(Human|Assistant|System)\s*:/gi, '### [FILTERED]:')
      .replace(/\b(Human|Assistant|System)\s*:\s*(?=\n)/gi, '[FILTERED]:')

      // Unicode control characters that could be used to hide injection
      .replace(/[\u200B-\u200D\uFEFF\u2060\u00A0]/g, ' ')

      // Null bytes
      .replace(/\0/g, '');

    return `"""\n${cleaned}\n"""`;
  }

  /**
   * Lightweight sanitization for contexts where full filtering is too aggressive.
   * Only strips null bytes and Unicode zero-width characters.
   */
  static sanitizeLight(content: string): string {
    return content
      .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
      .replace(/\0/g, '');
  }
}
