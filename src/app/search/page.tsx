'use client';

import FavListing from '@/components/record/FavListing';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import {
  getOrCreateAlgoliaSecuredApiKey,
  searchAlgolia,
} from '@/lib/firebase/store';
import { FavConfigProvider } from '@/lib/theme';
import { FavRecord } from '@/types/FavRecord';
import { Search } from '@mui/icons-material';
import { Input, Spin, message } from 'antd';
import { useContext, useEffect, useState } from 'react';

export default function SearchPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [records, setRecords] = useState<FavRecord[]>([]);
  const [apiKey, setApiKey] = useState<string | null | undefined>(undefined);
  const user = useContext(FirebaseAuthContext).user;

  const onInputChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value || e.target.value.length === 0) {
      setRecords([]);
      return;
    }

    if (apiKey) {
      const hits = await searchAlgolia(apiKey, e.target.value);
      setRecords(hits);
    }
  };

  const onRemove = async (url: string) => {
    console.log('TODO');
  };
  const onUpdate = async (url: string) => {
    console.log('TODO');
  };

  useEffect(() => {
    if (user) {
      getOrCreateAlgoliaSecuredApiKey(user).then((key) => {
        // TODO: should create only if allowed in settings
        if (key instanceof Error) {
          messageApi.error({
            content: `Error: ${key.message}`,
          });
        } else {
          setApiKey(key);
        }
      });
    }
  }, [user, messageApi]);

  return (
    <FavConfigProvider>
      {contextHolder}
      <Spin spinning={apiKey === undefined} fullscreen />

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
            records={records}
            onRemove={onRemove}
            onUpdate={onUpdate}
            notAllowEdit
          />
        </div>
      </div>
    </FavConfigProvider>
  );
}
