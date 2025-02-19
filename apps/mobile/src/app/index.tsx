import { api } from '@/clients';
import type { ReactElement } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function Index(): ReactElement {
  const { data, isLoading } = api.healthz.useQuery({ queryKey: ['healthz'] });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Text>
          {data?.status} - {data?.body.message}
        </Text>
      )}
    </View>
  );
}
