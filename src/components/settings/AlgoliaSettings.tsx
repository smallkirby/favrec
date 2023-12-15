'use client';

import { updateGeneralSettings } from '@/lib/firebase/store';
import { FavConfigProvider } from '@/lib/theme';
import { FirebaseUser } from '@/types/FirebaseUser';
import { Settings } from '@/types/Settings';
import { Switch, message } from 'antd';
import { useEffect, useState } from 'react';

type Props = {
  user: FirebaseUser;
  settings: Settings;
};

export default function AlgoliaSettings({ user, settings }: Props) {
  const [isEnabled, setIsEnabled] = useState(settings.algoliaEnabled === true);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    updateGeneralSettings(user, { algoliaEnabled: isEnabled }).then((res) => {
      messageApi.destroy();

      if (res instanceof Error) {
        messageApi.error({
          content: `Error: ${res.message}`,
        });
      } else {
        messageApi.success({
          content: 'Updated Algolia settings.',
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled]);

  return (
    <>
      <FavConfigProvider>
        {contextHolder}

        <div className="mb-3 flex items-center">
          <h2 className="mb-1 mr-4 text-2xl font-bold">Algolia Search</h2>
          <Switch
            className="bg-slate-600"
            checked={isEnabled}
            onClick={() => setIsEnabled(!isEnabled)}
          />
        </div>
        <p className="mb-3">
          Enabling this will empower your search experience with Algolia.
        </p>
        <p className="text-xs text-slate-500">
          If this setting is enabled, your records will be indexed by{' '}
          <a
            href="https://www.algolia.com/"
            className="text-pink-500 underline"
          >
            Algolia
          </a>
          . Each user is granted a unique API key to access their own records,
          so your data is inaccessible to others. You can delete the stored data
          at any time by disabling this setting. It might take a few minutes for
          the data to be indexed or removed since you change this setting.
        </p>
      </FavConfigProvider>
    </>
  );
}
