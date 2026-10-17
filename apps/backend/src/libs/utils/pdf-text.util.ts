import { BadRequestException } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

/**
 * The text layer of a PDF. A scanned PDF has none, which is reported as a
 * 400 rather than handed on: an LLM would only make content up.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  let text: string;
  let pages: Array<{ text: string }>;
  try {
    ({ text, pages } = await parser.getText());
  } finally {
    await parser.destroy();
  }

  // Checked per page: the joined text always has "-- 1 of 1 --" markers
  if (pages.every((page) => !page.text.trim())) {
    throw new BadRequestException(
      'No text found in this PDF. Scanned documents are not supported yet.',
    );
  }
  // ...which aren't part of the document (and show when text is reviewed)
  return text
    .replace(/\n*-- \d+ of \d+ --\n*/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
