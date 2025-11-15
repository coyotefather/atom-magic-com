// app/providers.tsx
'use client';

import { HeroUIProvider } from '@heroui/react';
import * as React from 'react';

export default function HeroProvider({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}