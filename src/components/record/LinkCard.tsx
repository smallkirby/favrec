'use client';

import { FavRecord } from '@/types/FavRecord';
import { Skeleton } from 'antd';
import Image from 'next/image';
import dayjs from 'dayjs';
import { DeleteForever } from '@mui/icons-material';

type Props = {
  page: FavRecord | null;
  onRemove: (url: string) => void;
};

export default function LinkCard({ page, onRemove }: Props) {
  return (
    <>
      <div
        className="flex-grow border-[1px] border-gray-300 drop-shadow-md rounded-lg justify-between overflow-hidden
            p-0 w-full min-h-[128px] max-w-5xl cursor-pointer cursor-pointer
            flex content-between hover:shadow-lg duration-300 items-stretch"
      >
        {page ? (
          <div className="h-full py-4 px-3 md:px-8 text-left w-full">
            <a href={page.url}>
              <h3 className="text-xs md:text-lg font-bold mb-2 overflow-hidden">
                {page.title}
              </h3>
            </a>
            <p className="text-xs md:text-sm text-gray-500 overflow-hidden">
              {page.description}
            </p>
            <div className="mt-3 flex justify-between flex-col md:flex-row items-center">
              <div className="flex items-center">
                <Image
                  src={page.faviconUrl ?? ''}
                  alt="favicon"
                  width={16}
                  height={16}
                  className="w-[14px] h-[14px] mr-1"
                />
                <span className="text-xs md:text-sm">{page.domain}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 mr-1">
                  Recorded at {dayjs(page.date).format('YYYY/MM/DD')}
                </span>
                <button onClick={() => onRemove(page.url)} className="z-50">
                  <DeleteForever className="opacity-50 hover:opacity-100 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 py-4 px-8 overflow-hidden h-4/5">
            <Skeleton active />
          </div>
        )}

        {page ? (
          <div className="w-[100px] md:w-[200px] flex justify-end flex-grow">
            {page.imageUrl ? (
              <Image
                src={page.imageUrl}
                alt={page.title}
                className="rounded-r-lg"
                width={0}
                height={0}
                style={{
                  height: '100%',
                  width: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Skeleton.Image
                style={{ height: '100%', width: '158' }}
                className="!w-[100px] md:!w-[158px]"
              />
            )}
          </div>
        ) : (
          <Skeleton.Image
            active={true}
            style={{ height: '100%', width: '158px' }}
            className="!w-[100px] md:w-![158px]"
          />
        )}
      </div>
    </>
  );
}
