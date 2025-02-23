import { createContext, useContext, type PropsWithChildren } from 'react';
import { useStorageState } from './localStorage';

interface IAuthInfo {
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}

const authContext = createContext<IAuthInfo>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// this hook can be used to access the user info.
export function useSession(): IAuthInfo {
  return useContext(authContext);
}

export function SessionProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  const {
    isLoading,
    value: session,
    setValue: setSession,
  } = useStorageState('session');

  return (
    <authContext.Provider
      value={{
        signIn: () => {
          setSession('TODO: add sign in logic later');
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {children}
    </authContext.Provider>
  );
}
