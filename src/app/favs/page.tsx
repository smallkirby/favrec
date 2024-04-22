'use client';

import FavListing from '@/components/record/FavListing';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import { deleteFav, getNumFavs, updateFav } from '@/lib/firebase/store';
import { FavConfigProvider } from '@/lib/theme';
import { Spin, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';

export default function FavsPage() {
  const router = useRouter();
  const user = useContext(FirebaseAuthContext).user;
  const [messageApi, contextHolder] = message.useMessage();
  const [countFetched, setCountFetched] = useState(false);
  const [numRecords, setNumRecords] = useState(0);

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
      setNumRecords(num);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <FavConfigProvider>
      {contextHolder}
      <Spin spinning={!countFetched} fullscreen />

      <div className="mx-auto w-full text-center md:w-2/3">
        <FavListing
          numRecords={numRecords}
          onRemove={onRemove}
          onUpdate={onUpdate}
        />
      </div>
    </FavConfigProvider>
  );
}
