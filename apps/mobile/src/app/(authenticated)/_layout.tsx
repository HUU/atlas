import { useSession } from '@/providers/auth';
import { Redirect, SplashScreen, Stack } from 'expo-router';
import type { ReactElement } from 'react';

export default function AppLayout(): ReactElement {
  const { session, isLoading } = useSession();

  if (isLoading) {
    void SplashScreen.preventAutoHideAsync();
    return <></>;
  } else if (!session) {
    SplashScreen.hide();
    return <Redirect href="/sign-in" />;
  } else {
    return <Stack />;
  }
}
