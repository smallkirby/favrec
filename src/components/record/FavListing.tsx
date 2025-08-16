'use client';

import { Build, DeleteForever, Update, Visibility } from '@mui/icons-material';
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
      <div className="sticky top-0 z-50 bg-slate-800 py-2">
        {/* Smartphone*/}
        <div className="sm:hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400 whitespace-nowrap">
              {numRecords > 0 &&
                `${(pageNum - 1) * perPage + 1}-${Math.min(pageNum * perPage, numRecords)} of ${numRecords}`}
            </div>
            <Tooltip title={mode === 'edit' ? 'Tool Mode' : 'View Mode'}>
              <div className="flex items-center gap-2">
                {mode === 'edit' ? (
                  <Build className="text-blue-400" style={{ fontSize: 16 }} />
                ) : (
                  <Visibility
                    className="text-slate-400"
                    style={{ fontSize: 16 }}
                  />
                )}
                <Switch
                  className="bg-slate-600"
                  onChange={(checked) => setMode(checked ? 'edit' : 'view')}
                  disabled={notAllowEdit}
                  checked={mode === 'edit'}
                />
              </div>
            </Tooltip>
          </div>
          <div className="flex justify-center">
            <Pagination
              current={pageNum}
              total={numRecords}
              pageSize={perPage}
              showSizeChanger={false}
              onChange={onPageChange}
            />
          </div>
        </div>

        {/* PC */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="text-sm text-slate-400 whitespace-nowrap w-32">
            {numRecords > 0 &&
              `${(pageNum - 1) * perPage + 1}-${Math.min(pageNum * perPage, numRecords)} of ${numRecords}`}
          </div>
          <div className="flex-1 flex justify-center">
            <Pagination
              current={pageNum}
              total={numRecords}
              pageSize={perPage}
              showSizeChanger={false}
              onChange={onPageChange}
            />
          </div>
          <div className="w-32 flex justify-end">
            <Tooltip title={mode === 'edit' ? 'Tool Mode' : 'View Mode'}>
              <div className="flex items-center gap-2">
                {mode === 'edit' ? (
                  <Build className="text-blue-400" style={{ fontSize: 16 }} />
                ) : (
                  <Visibility
                    className="text-slate-400"
                    style={{ fontSize: 16 }}
                  />
                )}
                <Switch
                  className="bg-slate-600"
                  onChange={(checked) => setMode(checked ? 'edit' : 'view')}
                  disabled={notAllowEdit}
                  checked={mode === 'edit'}
                />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <div className="w-full max-w-4xl">
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
      </div>
    </FavConfigProvider>
  );
}
