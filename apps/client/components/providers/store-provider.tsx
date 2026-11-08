'use client';
import { type PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { store } from '@/stores/store';

// No PersistGate: it renders `loading` (null) on the server, which left every
// page's HTML empty for crawlers. The persist whitelist is empty, so there is
// nothing to wait for. If a slice is ever persisted, gate only the screen that
// reads it, never the whole app.
export default function StoreProvider({ children }: PropsWithChildren) {
  return <Provider store={store}>{children}</Provider>;
}
