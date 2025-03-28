'use client';

import { message, Switch } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { updateGeneralSettings } from '@/lib/firebase/store';
import { SettingsContext } from '@/lib/SettingsProvider';
import { FavConfigProvider } from '@/lib/theme';
import type { FirebaseUser } from '@/types/FirebaseUser';
import type { Settings } from '@/types/Settings';

type Props = {
  user: FirebaseUser;
  settings: Settings;
};

export default function AlgoliaSettings({ user, settings }: Props) {
  const [isEnabled, setIsEnabled] = useState(settings.algoliaEnabled === true);
  const [messageApi, contextHolder] = message.useMessage();
  const setSettings = useContext(SettingsContext).setSettings;

  useEffect(() => {
    if (isEnabled === settings.algoliaEnabled) {
      return;
    }

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
        setSettings({ ...settings, algoliaEnabled: isEnabled });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEnabled,
    messageApi.error,
    messageApi.destroy,
    messageApi.success,
    setSettings,
    settings,
    user,
  ]);

  return (
    <>
      <FavConfigProvider>
        {contextHolder}

        <div className="mb-3 flex items-center justify-between pr-4">
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
