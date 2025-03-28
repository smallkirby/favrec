'use client';

import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import { getCustomToken } from '@/lib/firebase/store';

export default function ExtensionPage() {
  const user = useContext(FirebaseAuthContext).user;
  const router = useRouter();
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    if (user === null) {
      router.push('/login');
      return;
    }
    if (user === undefined) {
      return;
    }

    if (user) {
      getCustomToken().then((t) => {
        setToken(t);
      });
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
      <code hidden={true} id="favrec-login-token">
        {token}
      </code>
    </div>
  );
}
