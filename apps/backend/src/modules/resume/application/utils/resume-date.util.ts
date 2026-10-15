const MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

/** "Present" and the like: an entry that hasn't ended. */
const ONGOING = /^(present|current|now|ongoing|today|hiện tại|nay)$/i;

/**
 * Month-precision ISO date, pinned to noon UTC on the 1st so it shows the
 * same month in every time zone (midnight UTC is the previous day in the US).
 */
function isoMonth(year: number, month: number): string | null {
  if (year < 1900 || year > 2100 || month < 1 || month > 12) return null;
  return new Date(Date.UTC(year, month - 1, 1, 12)).toISOString();
}

/**
 * Turns a resume date as Gemini or a CV writes it ("2021-03", "03/2021",
 * "Mar 2021", "Tháng 3/2021", "2021") into the ISO string the editor and
 * `@IsDateString` expect. Returns null for "Present" or anything unreadable.
 */
export function toResumeIsoDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value
    .trim()
    .toLowerCase()
    .replace(/^(tháng|thg|th)\s*/, '');
  if (!text || ONGOING.test(text)) return null;

  let match: RegExpMatchArray | null;
  // 2021-03, 2021/03, 2021-03-15 and full ISO date-times
  if (
    (match = text.match(/^(\d{4})[-/.](\d{1,2})(?:[-/.]\d{1,2})?(?:t.*)?$/))
  ) {
    return isoMonth(Number(match[1]), Number(match[2]));
  }
  // 03/2021, 3-2021, 03.2021
  if ((match = text.match(/^(\d{1,2})[-/.](\d{4})$/))) {
    return isoMonth(Number(match[2]), Number(match[1]));
  }
  // 15/03/2021: day first (as in Vietnam and Europe) unless that can't be
  if ((match = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/))) {
    const [first, second] = [Number(match[1]), Number(match[2])];
    return isoMonth(Number(match[3]), second > 12 ? first : second);
  }
  // Mar 2021, March, 2021, Sept. 2021
  if ((match = text.match(/^([a-z]{3,})\.?,?\s+(\d{4})$/))) {
    const month = MONTHS.indexOf(match[1].slice(0, 3)) + 1;
    return month ? isoMonth(Number(match[2]), month) : null;
  }
  // 2021
  if ((match = text.match(/^(\d{4})$/))) {
    return isoMonth(Number(match[1]), 1);
  }
  return null;
}
