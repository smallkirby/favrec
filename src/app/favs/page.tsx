'use client';

import LinkCard from '@/components/record/LinkCard';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import { getAllFavs, getNumFavs } from '@/lib/firebase/store';
import { FavRecord } from '@/types/FavRecord';
import { Pagination, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
const perPage = 50;

export default function FavsPage() {
  const [numTotal, setNumTotal] = useState(0);
  const user = useContext(FirebaseAuthContext).user;
  const [pageNum, setPageNum] = useState(1);
  const [records, setRecords] = useState<FavRecord[]>([]);
  const [allRecords, setAllRecords] = useState<FavRecord[]>([]);
  const router = useRouter();

  const onPageChange = (page: number, _: number) => {
    setPageNum(page);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, allRecords]);

  return (
    <>
      <Spin spinning={user === undefined} fullscreen />

      {user !== undefined && (
        <div className="text-center w-full md:w-2/3 mx-auto">
          <Pagination
            defaultCurrent={pageNum}
            total={numTotal}
            defaultPageSize={perPage}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
            showSizeChanger={false}
            onChange={onPageChange}
            className="mb-8"
          />

          <div>
            {records.map((record) => (
              <div key={record.url} className="mb-4">
                <LinkCard page={record} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
