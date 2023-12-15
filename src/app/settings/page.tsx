'use client';

import BskySettings from '@/components/settings/BskySettings';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import { getGeneralSettings } from '@/lib/firebase/store';
import { Spin, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';
import { SettingsContext } from '@/lib/SettingsProvider';
import AlgoliaSettings from '@/components/settings/AlgoliaSettings';

export default function SettingsPage() {
  const user = useContext(FirebaseAuthContext).user;
  const { settings, setSettings } = useContext(SettingsContext);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (user === null) {
      router.push('/login');
      return;
    } else if (user) {
      getGeneralSettings(user).then((res) => {
        if (res instanceof Error) {
          console.error(res);
          messageApi.error({
            content: `Error: ${res.message}`,
          });
        } else {
          setSettings(res);
        }
      });
    }
  }, [user, router, messageApi, setSettings]);

  return (
    <>
      {contextHolder}

      <div className="mx-auto w-full md:w-2/3">
        <h1 className="w-full border-b-[1px] border-slate-600 pb-2 text-3xl font-bold">
          Settings
        </h1>

        {user && settings ? (
          <>
            <div className="mt-8">
              <AlgoliaSettings user={user} settings={settings!} />
            </div>

            <div className="mt-8">
              <BskySettings user={user} settings={settings!} />
            </div>
          </>
        ) : (
          <Spin fullscreen />
        )}
      </div>
    </>
  );
}
