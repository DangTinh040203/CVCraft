import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { fromBuffer } from 'file-type';

/** Leading newline/BOM before %PDF is common from some exporters; file-type only checks offset 0. */
function isPdfMagicBytes(buffer: Buffer): boolean {
  const scanLimit = Math.min(buffer.length, 4096);
  let i = 0;
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xef &&
    buffer[1] === 0xbb &&
    buffer[2] === 0xbf
  ) {
    i = 3;
  }
  while (i < scanLimit) {
    const b = buffer[i];
    if (b === 0x09 || b === 0x0a || b === 0x0d || b === 0x20) {
      i++;
      continue;
    }
    break;
  }
  return (
    i + 4 <= buffer.length &&
    buffer[i] === 0x25 &&
    buffer[i + 1] === 0x50 &&
    buffer[i + 2] === 0x44 &&
    buffer[i + 3] === 0x46
  );
}

/**
 * Validates uploaded files by checking the actual file content (magic bytes)
 * instead of relying on the user-provided Content-Type MIME header.
 *
 * This prevents attackers from uploading malicious files disguised as PDFs.
 */
@Injectable()
export class FileMagicBytesValidator implements PipeTransform {
  constructor(private readonly allowedMimes: string[]) {}

  async transform(file: Express.Multer.File): Promise<Express.Multer.File> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    let fileType = await fromBuffer(file.buffer);

    if (
      (!fileType || !this.allowedMimes.includes(fileType.mime)) &&
      this.allowedMimes.includes('application/pdf') &&
      isPdfMagicBytes(file.buffer)
    ) {
      fileType = { ext: 'pdf', mime: 'application/pdf' };
    }

    if (!fileType || !this.allowedMimes.includes(fileType.mime)) {
      throw new BadRequestException(
        `Invalid file type. Expected: ${this.allowedMimes.join(', ')}. ` +
          `Detected: ${fileType?.mime ?? 'unknown'}`,
      );
    }

    return file;
  }
}
