'use client';

import LoginBox from '@/components/login/LoginBox';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';

export default function Login() {
  const router = useRouter();
  const authContext = useContext(FirebaseAuthContext);

  useEffect(() => {
    if (authContext.user) {
      router.push('/');
    }
  }, [authContext.user, router]);

  return (
    <div className="mx-auto w-full pt-8 text-center">
      <LoginBox />
    </div>
  );
}
