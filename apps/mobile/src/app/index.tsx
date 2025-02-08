import { apiClient } from '@/clients';
import { callAsyncEventHandler } from '@atlas/common';
import { useState, type ReactElement } from 'react';
import { Button, Text, View } from 'react-native';

export default function Index(): ReactElement {
  const [result, setResult] = useState<string>('');

  const handleQueryPressed = async (): Promise<void> => {
    const { status, body } = await apiClient.healthz();
    if (status === 200) {
      setResult(body.message);
    } else {
      setResult(`Error: ${status}`);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Button
        title="Query Server"
        onPress={callAsyncEventHandler(handleQueryPressed)}
      ></Button>
      <Text>{result}</Text>
    </View>
  );
}
