// app/providers.tsx
'use client';

import * as React from 'react';

export default function HeroProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}