'use client';

import { Button, Card, Image, Spin } from 'antd';
import {
  GithubAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { useCallback, useContext, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { auth } from '@/lib/firebase/app';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import { FavConfigProvider } from '@/lib/theme';

export default function LoginBox() {
  const [isLoading, setLoading] = useState(false);
  const user = useContext(FirebaseAuthContext).user;

  const onClickLogin = useCallback(async () => {
    setLoading(true);

    if (isMobile) {
      await signInWithPopup(auth, new GithubAuthProvider());
    } else {
      await signInWithRedirect(auth, new GithubAuthProvider());
    }
  }, []);

  return (
    <FavConfigProvider>
      <Spin spinning={isLoading || user === undefined} fullscreen={true} />
      <Card
        className="!mx-auto !border-slate-600 text-center shadow-sm drop-shadow-md md:mx-auto
          md:w-96"
      >
        <div className="my-2">
          <Image
            src="/logo/github-mark-white.png"
            alt="GitHub Logo"
            width={50}
          />
          <div className="mt-2">
            <h1 className="mb-4 text-lg">Sign in with GitHub</h1>
            <Button
              className="w-48 bg-[#ff00ff]"
              loading={isLoading}
              onClick={onClickLogin}
              type="primary"
            >
              <span className="font-bold">Login / Signup</span>
            </Button>
          </div>
        </div>
      </Card>
    </FavConfigProvider>
  );
}
