'use client';

import { message, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import FavListing from '@/components/record/FavListing';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import {
  deleteFav,
  getFavsPaginated,
  getNumFavs,
  updateFav,
} from '@/lib/firebase/store';
import { FavConfigProvider } from '@/lib/theme';

export default function FavsPage() {
  const router = useRouter();
  const user = useContext(FirebaseAuthContext).user;
  const [messageApi, contextHolder] = message.useMessage();
  const [countFetched, setCountFetched] = useState(false);
  const [numRecords, setNumRecords] = useState(0);

  const fetchRecords = async (page: number, limit: number) => {
    return getFavsPaginated(limit, page);
  };

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
        setNumRecords((prev) => prev);
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

      setNumRecords((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (user === null) {
      router.push('/login');
      return;
    }
    if (user === undefined) {
      return;
    }

    // First, fetch only the number of records and set skeltons for them
    getNumFavs(user).then((num) => {
      setCountFetched(true);
      setNumRecords(num);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router.push]);

  return (
    <FavConfigProvider>
      {contextHolder}
      <Spin spinning={!countFetched} fullscreen={true} />

      <div className="mx-auto w-full text-center md:w-2/3">
        <FavListing
          fetchRecords={fetchRecords}
          numRecords={numRecords}
          onRemove={onRemove}
          onUpdate={onUpdate}
        />
      </div>
    </FavConfigProvider>
  );
}
