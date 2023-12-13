'use client';

import LinkCard from '@/components/record/LinkCard';
import { FirebaseAuthContext } from '@/lib/firebase/auth';
import {
  deleteFav,
  getAllFavs,
  getNumFavs,
  updateFav,
} from '@/lib/firebase/store';
import { FavConfigProvider } from '@/lib/theme';
import { FavRecord } from '@/types/FavRecord';
import { Pagination, Spin, Switch, message, Button, Tooltip } from 'antd';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { DeleteForever, Update } from '@mui/icons-material';
const perPage = 50;

type Props = {};

const EditTools = ({
  page,
  onRemove,
  onUpdate,
}: {
  page: FavRecord;
  onRemove: (page: FavRecord) => void;
  onUpdate: (page: FavRecord) => void;
}) => {
  return (
    <div className="flex flex-col">
      <Tooltip title="Get and update page information again." className="mb-2">
        <Button
          icon={<Update />}
          shape="circle"
          onClick={() => onUpdate(page)}
        />
      </Tooltip>
      <Tooltip title="Remove this record.">
        <Button
          danger
          icon={<DeleteForever />}
          shape="circle"
          onClick={() => onRemove(page)}
        />
      </Tooltip>
    </div>
  );
};

export default function FavListing({}: Props) {
  const [numTotal, setNumTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [records, setRecords] = useState<FavRecord[]>([]);
  const user = useContext(FirebaseAuthContext).user;
  const [allRecords, setAllRecords] = useState<FavRecord[]>([]);
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [countFetched, setCountFetched] = useState(false);

  const onPageChange = (page: number, _: number) => {
    setPageNum(page);
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
      setNumTotal(num);
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

  useEffect(() => {
    setRecords(allRecords.slice((pageNum - 1) * perPage, pageNum * perPage));
    setNumTotal(allRecords.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, allRecords]);

  return (
    <FavConfigProvider>
      {contextHolder}
      <Spin spinning={!countFetched} fullscreen />

      {user !== undefined && (
        <div className="mx-auto w-full text-center md:w-2/3">
          <div className="sticky top-0 z-50 flex items-center justify-between bg-white py-2 dark:bg-slate-800">
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
            <Switch
              className="ml-2 bg-slate-600"
              onChange={(checked) => setMode(checked ? 'edit' : 'view')}
            />
          </div>

          <div>
            {records.map((record, ix) => (
              <div
                key={record ? record.url : ix}
                className="mb-4 flex items-center"
              >
                <div className="mr-2" hidden={mode === 'view'}>
                  <EditTools
                    page={record}
                    onRemove={(p) => onRemove(p.url)}
                    onUpdate={(p) => {
                      onUpdate(p.url);
                    }}
                  />
                </div>
                <LinkCard page={record} onRemove={onRemove} />
              </div>
            ))}
          </div>
        </div>
      )}
    </FavConfigProvider>
  );
}
