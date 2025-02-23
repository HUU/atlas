import { useStagingStatus } from '@/providers/clients';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as Application from 'expo-application';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export const DeveloperMenu = (): ReactElement => {
  const { isStaging, toggleStaging } = useStagingStatus();
  const { showActionSheetWithOptions } = useActionSheet();
  const version = Application.nativeApplicationVersion;
  const buildNumber = Application.nativeBuildVersion;

  const handleLongPress = (): void => {
    showActionSheetWithOptions(
      {
        options: [
          `Switch to ${isStaging ? (__DEV__ ? 'Development' : 'Production') : 'Staging'}`,
          'Cancel',
        ],
        cancelButtonIndex: 1,
      },
      (selectedIndex) => {
        if (selectedIndex === 0) {
          // Switch to Production/Staging/Development
          toggleStaging();
        }
      },
    );
  };

  return (
    <Pressable onLongPress={handleLongPress}>
      <Text style={styles.versionText}>
        Version {version}.{buildNumber}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  versionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
