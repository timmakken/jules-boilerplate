'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  // session: any; // Optional: if passing initial session state from server component
}

export default function Providers({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}
