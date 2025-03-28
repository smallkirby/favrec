'use client';

import { DeleteForever, Update } from '@mui/icons-material';
import { Button, message, Pagination, Switch, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import LinkCard from '@/components/record/LinkCard';
import { FavConfigProvider } from '@/lib/theme';
import type { FavRecord } from '@/types/FavRecord';

type Props = {
  numRecords: number;
  fetchRecords: (page: number, limit: number) => Promise<FavRecord[]>;
  onUpdate: (url: string) => Promise<void>;
  onRemove: (url: string) => Promise<void>;
  notAllowEdit?: boolean;
};

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
          danger={true}
          icon={<DeleteForever />}
          shape="circle"
          onClick={() => onRemove(page)}
        />
      </Tooltip>
    </div>
  );
};

export default function FavListing({
  numRecords,
  fetchRecords,
  onUpdate,
  onRemove,
  notAllowEdit,
}: Props) {
  const [pageNum, setPageNum] = useState(1);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [recordsShowing, setRecordsShowing] = useState<FavRecord[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const perPage = 30;

  const onPageChange = (page: number, _: number) => {
    setPageNum(page);
  };

  useEffect(() => {
    setRecordsShowing(new Array(perPage).fill(null));

    fetchRecords(pageNum - 1, perPage)
      .then((res) => {
        setRecordsShowing(res);
      })
      .catch((err) => {
        messageApi.open({
          key: 'favs-fetch',
          type: 'error',
          content: `Error: ${err.message}`,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, fetchRecords, messageApi.open]);

  return (
    <FavConfigProvider>
      {contextHolder}
      <div className="sticky top-0 z-50 flex items-center justify-between bg-slate-800 py-2">
        <Pagination
          defaultCurrent={pageNum}
          total={numRecords}
          defaultPageSize={perPage}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
          showSizeChanger={false}
          onChange={onPageChange}
        />
        <Switch
          className="ml-2 bg-slate-600"
          onChange={(checked) => setMode(checked ? 'edit' : 'view')}
          disabled={notAllowEdit}
        />
      </div>

      <div>
        {recordsShowing.map((record, ix) => (
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
    </FavConfigProvider>
  );
}
