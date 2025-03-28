'use client';

import { createContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/app';
import type { AuthContextState, FirebaseUser } from '@/types/FirebaseUser';

const FirebaseAuthContext = createContext<AuthContextState>({
  user: undefined,
});

type Props = {
  children: React.ReactNode;
};

const FirebaseAuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<FirebaseUser | null | undefined>(undefined);

  useEffect(() => {
    setUser(undefined);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser({
          uid: user.uid,
          displayName: user.displayName,
          photoUrl: user.photoURL,
          providerId: user.providerId,
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseAuthContext.Provider value={{ user }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const logout = async () => {
  await auth.signOut();
};

export { FirebaseAuthContext, FirebaseAuthProvider };
