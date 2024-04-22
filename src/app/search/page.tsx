'use client';

import FavListing from '@/components/record/FavListing';
import { SettingsContext } from '@/lib/SettingsProvider';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import {
  getGeneralSettings,
  getOrCreateAlgoliaSecuredApiKey,
  searchAlgolia,
} from '@/lib/firebase/store';
import { FavConfigProvider } from '@/lib/theme';
import { FavRecord } from '@/types/FavRecord';
import { Search } from '@mui/icons-material';
import { Input, Modal, Spin, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

export default function SearchPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [numRecords, setNumRecords] = useState(0);
  const [records, setRecords] = useState<(FavRecord | null)[]>([]);
  const [apiKey, setApiKey] = useState<string | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const user = useContext(FirebaseAuthContext).user;
  const { settings, setSettings } = useContext(SettingsContext);
  const [modal, modalContextHolder] = Modal.useModal();
  const router = useRouter();

  const onInputChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    if (!e.target.value || e.target.value.length === 0) {
      setLoading(false);
      setNumRecords(0);
      setRecords([]);
      return;
    }

    if (apiKey) {
      const hits = await searchAlgolia(apiKey, e.target.value);
      setNumRecords(hits.length);
      setRecords(hits);
      setLoading(false);
    }
  };

  const fetchRecords = async (
    page: number,
    limit: number
  ): Promise<FavRecord[]> => {
    return records.slice(page * limit, (page + 1) * limit) as FavRecord[];
  };

  const onRemove = async (url: string) => {
    console.log('TODO');
  };
  const onUpdate = async (url: string) => {
    console.log('TODO');
  };

  useEffect(() => {
    if (user) {
      if (settings === undefined) {
        getGeneralSettings(user).then((res) => {
          if (res instanceof Error) {
          } else {
            setSettings(res);
          }
        });
      }
    } else if (user === null) {
      router.push('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSettings, settings, user]);

  useEffect(() => {
    if (user) {
      getOrCreateAlgoliaSecuredApiKey(user).then((key) => {
        // TODO: should create only if allowed in settings
        if (key instanceof Error) {
          messageApi.error({
            content: `Error: ${key.message}`,
          });
          modal.error({
            title: 'Operation Needed',
            content: (
              <div>
                <p>You have to allow Algolia integration in Settings page.</p>
                <p>We will redirect you to Settings page.</p>
              </div>
            ),
            onOk: () => {
              router.push('/settings');
            },
          });
        } else {
          setApiKey(key);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <FavConfigProvider>
      {contextHolder}
      {modalContextHolder}
      <Spin spinning={apiKey === undefined || loading} fullscreen />

      <div className="mx-auto w-full text-center md:w-2/3">
        <Input
          size="large"
          placeholder="Search for your favorites"
          className="w-full"
          prefix={<Search className="text-[#ff00ff]" />}
          onChange={onInputChanged}
        />

        <div className="mt-8">
          <FavListing
            fetchRecords={fetchRecords}
            numRecords={numRecords}
            onRemove={onRemove}
            onUpdate={onUpdate}
            notAllowEdit
          />
        </div>
      </div>
    </FavConfigProvider>
  );
}
