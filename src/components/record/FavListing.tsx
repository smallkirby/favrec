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
    <div className="flex flex-col gap-3">
      <Tooltip title="Get and update page information again.">
        <Button
          icon={<Update />}
          shape="circle"
          size="large"
          className="border-pink-400/50 text-pink-400 hover:border-pink-300 hover:text-pink-300 
            hover:shadow-lg hover:shadow-pink-400/20 transition-all duration-300"
          onClick={() => onUpdate(page)}
        />
      </Tooltip>
      <Tooltip title="Remove this record.">
        <Button
          danger={true}
          icon={<DeleteForever />}
          shape="circle"
          size="large"
          className="border-red-400/50 text-red-400 hover:border-red-300 hover:text-red-300 
            hover:shadow-lg hover:shadow-red-400/20 transition-all duration-300"
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
      <div className="sticky top-0 z-50 bg-slate-800 py-2 sm:py-3 border-b border-slate-700/50">
        {/* Smartphone*/}
        <div className="sm:hidden px-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-300 font-medium whitespace-nowrap">
              {numRecords > 0 &&
                `${(pageNum - 1) * perPage + 1}-${Math.min(pageNum * perPage, numRecords)} of ${numRecords}`}
            </div>
            <Tooltip title={mode === 'edit' ? 'Tool Mode' : 'View Mode'}>
              <div className="flex items-center gap-2">
                {mode === 'edit' ? (
                  <Build className="text-pink-400" style={{ fontSize: 16 }} />
                ) : (
                  <Visibility
                    className="text-slate-400"
                    style={{ fontSize: 16 }}
                  />
                )}
                <Switch
                  className="bg-slate-600 hover:bg-slate-500 transition-colors duration-200"
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
        <div className="hidden sm:flex items-center justify-between px-6">
          <div className="text-sm text-slate-300 font-medium whitespace-nowrap w-40">
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
          <div className="w-40 flex justify-end">
            <Tooltip title={mode === 'edit' ? 'Tool Mode' : 'View Mode'}>
              <div className="flex items-center gap-2">
                {mode === 'edit' ? (
                  <Build className="text-pink-400" style={{ fontSize: 16 }} />
                ) : (
                  <Visibility
                    className="text-slate-400"
                    style={{ fontSize: 16 }}
                  />
                )}
                <Switch
                  className="bg-slate-600 hover:bg-slate-500 transition-colors duration-200"
                  onChange={(checked) => setMode(checked ? 'edit' : 'view')}
                  disabled={notAllowEdit}
                  checked={mode === 'edit'}
                />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4 sm:mt-6">
        <div className="w-full max-w-5xl px-2 sm:px-4">
          {recordsShowing.map((record, ix) => (
            <div
              key={record ? record.url : ix}
              className="mb-4 sm:mb-6 flex items-center animate-in fade-in-50 duration-300"
              style={{ animationDelay: `${ix * 50}ms` }}
            >
              <div className="mr-3" hidden={mode === 'view'}>
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
