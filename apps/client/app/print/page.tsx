import { type Metadata } from 'next';

import { PrintDocument } from '@/components/print/print-document';

export const metadata: Metadata = {
  title: 'Print',
  robots: { index: false, follow: false },
};

/**
 * Bare, chrome-free page that the backend's headless Chromium opens to export
 * a resume as PDF. The data is injected by the backend before load.
 */
export default function PrintPage() {
  return <PrintDocument />;
}
