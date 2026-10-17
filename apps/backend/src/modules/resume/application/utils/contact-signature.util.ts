type Entry = Record<string, unknown>;

const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

/**
 * Contact kinds that belong in an email signature, in signature order. A
 * resume's contact section can also hold an address or a birth date, which
 * stay out.
 */
const KINDS: Array<{
  kind: string;
  matches: (label: string, value: string) => boolean;
}> = [
  {
    kind: 'phone',
    matches: (label, value) =>
      /phone|mobile|tel|zalo|whatsapp|sđt|điện thoại/i.test(label) ||
      /^\+?[\d\s().-]{8,}$/.test(value),
  },
  {
    kind: 'email',
    matches: (_, value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },
  {
    kind: 'linkedin',
    matches: (label, value) => /linkedin/i.test(`${label} ${value}`),
  },
  {
    kind: 'github',
    matches: (label, value) => /github|gitlab/i.test(`${label} ${value}`),
  },
  {
    kind: 'website',
    matches: (label, value) =>
      /portfolio|website|web|blog|site|homepage/i.test(label) ||
      /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(value),
  },
];

/** Personal details that look like contacts (a date reads like a phone). */
const EXCLUDED_LABELS =
  /birth|dob|sinh|address|địa chỉ|gender|giới tính|nationality|quốc tịch/i;

/**
 * The lines signed under the candidate's name, from the resume's contact
 * section as written ("Phone: +84 ..."), so the details are never the model's
 * invention. Values already in `body` are skipped.
 */
export function contactSignature(resume: Entry, body = ''): string[] {
  const entries = Array.isArray(resume.information)
    ? (resume.information as Entry[])
    : [];
  const seen = new Set<string>();
  const lines: Array<{ rank: number; index: number; line: string }> = [];

  entries.forEach((entry, index) => {
    const label = str(entry.label);
    const value = str(entry.value);
    if (!value || seen.has(value.toLowerCase())) return;
    if (EXCLUDED_LABELS.test(label)) return;
    const rank = KINDS.findIndex((kind) => kind.matches(label, value));
    if (rank === -1 || body.includes(value)) return;
    seen.add(value.toLowerCase());
    lines.push({ rank, index, line: label ? `${label}: ${value}` : value });
  });

  return lines
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ line }) => line);
}
