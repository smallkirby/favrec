'use client';

import FavListing from '@/components/record/FavListing';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import {
  deleteFav,
  getAllFavs,
  getNumFavs,
  updateFav,
} from '@/lib/firebase/store';
import { FavConfigProvider } from '@/lib/theme';
import { FavRecord } from '@/types/FavRecord';
import { Spin, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

export default function FavsPage() {
  const [allRecords, setAllRecords] = useState<FavRecord[]>([]);
  const router = useRouter();
  const user = useContext(FirebaseAuthContext).user;
  const [messageApi, contextHolder] = message.useMessage();
  const [countFetched, setCountFetched] = useState(false);

  const onUpdate = async (url: string) => {
    const key = 'update';
    if (user) {
      messageApi.open({
        key,
        type: 'loading',
        content: 'Updating your fav...',
        duration: 0,
      });
      const res = await updateFav(url);

      if (res instanceof Error) {
        messageApi.open({
          key,
          type: 'error',
          content: `Error: ${res.message}`,
        });
      } else {
        messageApi.open({
          key,
          type: 'success',
          content: 'Updated successfully.',
        });
        const newRecord = res as FavRecord;
        setAllRecords(
          allRecords.map((record) =>
            record.url === newRecord.url ? newRecord : { ...record }
          )
        );
      }
    }
  };

  const onRemove = async (url: string) => {
    const key = 'remove';
    if (user) {
      messageApi.open({
        key,
        type: 'loading',
        content: 'Removing your fav...',
        duration: 0,
      });
      await deleteFav(user, url);

      messageApi.open({
        key,
        type: 'success',
        content: 'Removed successfully.',
      });
      setAllRecords(allRecords.filter((record) => record.url !== url));
    }
  };

  useEffect(() => {
    if (user === null) {
      router.push('/login');
      return;
    } else if (user === undefined) {
      return;
    }

    // First, fetch only the number of records and set skeltons for them
    getNumFavs(user).then((num) => {
      setCountFetched(true);
      if (allRecords.length === 0) {
        setAllRecords(new Array(num).fill(null));
      }
      // Then, fetch actual all records
      // TODO: It is desirable to fetch num of records and actual records at once in parallel.
      getAllFavs(user).then((records) => setAllRecords(records));
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <FavConfigProvider>
      {contextHolder}
      <Spin spinning={!countFetched} fullscreen />

      <div className="mx-auto w-full text-center md:w-2/3">
        <FavListing
          records={allRecords}
          onRemove={onRemove}
          onUpdate={onUpdate}
        />
      </div>
    </FavConfigProvider>
  );
}
