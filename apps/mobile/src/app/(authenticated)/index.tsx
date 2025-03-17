import { useSession } from '@/providers/auth';
import { api } from '@/providers/clients';
import type { ReactElement } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function Index(): ReactElement {
  const { data, isLoading, error } = api.healthz.useQuery({
    queryKey: ['healthz'],
  });
  const { signOut } = useSession();

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
      ) : error ? (
        <Text>Failed to retrieve API result.</Text>
      ) : (
        <Text>
          {data?.status} - {data?.body.message}
        </Text>
      )}
      <Text
        onPress={() => {
          signOut();
        }}
      >
        Sign Out
      </Text>
    </View>
  );
}
