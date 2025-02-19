import { Providers } from '@/providers';
import { Stack } from 'expo-router';
import type { ReactElement } from 'react';

export default function RootLayout(): ReactElement {
  return (
    <Providers>
      <Stack />
    </Providers>
  );
}
