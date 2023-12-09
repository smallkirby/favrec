'use client';

import { FirebaseAuthContext } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/app';

export default function ExtensionPage() {
  const user = useContext(FirebaseAuthContext).user;
  const router = useRouter();
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    if (user === null) {
      router.push('/login');
      return;
    } else if (user === undefined) {
      return;
    }

    if (user) {
      auth.currentUser!.getIdToken().then((t) => setToken(t));
    }
  }, [user, router]);

  return (
    <div className="mt-4">
      <h1 className="mb-4 text-3xl">Extension Page</h1>
      <p>FavRec can integrate with Chrome Extension.</p>
      <p>Open this page after the installation of FavRec Extension.</p>
      <p>
        Then click <span className="font-bold text-pink-500">Login</span> button
        on the Extension popup.
      </p>
      <code hidden id="favrec-login-token">
        {token}
      </code>
    </div>
  );
}
