'use client';

import LinkCard from '@/components/record/LinkCard';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import { deleteFav, getAllFavs, getNumFavs } from '@/lib/firebase/store';
import { FavConfigProvider } from '@/lib/theme';
import { FavRecord } from '@/types/FavRecord';
import { Pagination, Spin, message } from 'antd';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
const perPage = 50;

type Props = {};

export default function FavListing({}: Props) {
  const [numTotal, setNumTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [records, setRecords] = useState<FavRecord[]>([]);
  const user = useContext(FirebaseAuthContext).user;
  const [allRecords, setAllRecords] = useState<FavRecord[]>([]);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();

  const onPageChange = (page: number, _: number) => {
    setPageNum(page);
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

    getNumFavs(user).then((num) => setNumTotal(num));
    getAllFavs(user).then((records) => setAllRecords(records));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    setRecords(allRecords.slice((pageNum - 1) * perPage, pageNum * perPage));
    setNumTotal(allRecords.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, allRecords]);

  return (
    <FavConfigProvider>
      {contextHolder}
      <Spin spinning={user === undefined} fullscreen />

      {user !== undefined && (
        <div className="mx-auto w-full text-center md:w-2/3">
          <div className="sticky top-0 z-50 bg-white py-2 dark:bg-slate-800">
            <Pagination
              defaultCurrent={pageNum}
              total={numTotal}
              defaultPageSize={perPage}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total}`
              }
              showSizeChanger={false}
              onChange={onPageChange}
            />
          </div>

          <div>
            {records.map((record) => (
              <div key={record.url} className="mb-4">
                <LinkCard page={record} onRemove={onRemove} />
              </div>
            ))}
          </div>
        </div>
      )}
    </FavConfigProvider>
  );
}
