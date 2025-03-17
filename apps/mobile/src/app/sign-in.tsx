import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { DeveloperMenu } from '@/components/DeveloperMenu';
import { useSession } from '@/providers/auth';
import type { ReactElement } from 'react';
import React from 'react';

export default function SignIn(): ReactElement {
  const { signIn } = useSession();
  return (
    <>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text
          onPress={() => {
            signIn();
            router.replace('/');
          }}
        >
          Sign In
        </Text>
      </View>
      <View style={{ marginTop: 'auto', marginBottom: 20 }}>
        <DeveloperMenu />
      </View>
    </>
  );
}
