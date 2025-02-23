import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useReducer } from 'react';

// TODO: evaluate replacing with Zustand like https://preview.redd.it/expo-router-and-splashscreen-the-right-way-v0-vly6hegf54gd1.png?width=1922&format=png&auto=webp&s=52bb9aa92e4c9dbde91f7ca20bbe75c8ee6e905e

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
  return useReducer(
    (_: [boolean, T | null], action: T | null = null): [boolean, T | null] => [
      false,
      action,
    ],
    initialValue,
  );
}

export async function setStorageItemAsync(
  key: string,
  value: string | null,
): Promise<void> {
  if (value == null) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export function useStorageState(key: string): {
  isLoading: boolean;
  value: string | null;
  setValue: (value: string | null) => void;
} {
  const [state, setState] = useAsyncState<string>();

  // Get
  useEffect(() => {
    void SecureStore.getItemAsync(key).then((value) => {
      setState(value);
    });
  }, [key]);

  const setValue = useCallback(
    (value: string | null) => {
      setState(value);
      void setStorageItemAsync(key, value);
    },
    [key],
  );

  return { isLoading: state[0], value: state[1], setValue };
}
