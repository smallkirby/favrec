'use client';

import { FavRecord } from '@/types/FavRecord';
import { Skeleton } from 'antd';
import Image from 'next/image';
import dayjs from 'dayjs';

type Props = {
  page: FavRecord | null;
};

export default function LinkCard({ page }: Props) {
  return (
    <>
      <a href={page?.url ?? ''}>
        <div
          className="border-[1px] border-gray-300 drop-shadow-md rounded-lg justify-between
            max-h-[140px] p-0 w-full max-w-5xl cursor-pointer flex content-between hover:shadow-lg duration-300"
        >
          {page ? (
            <div className="flex-grow h-full py-4 px-8 text-left">
              <h3 className="text-lg font-bold mb-2 overflow-hidden">
                {page.title}
              </h3>
              <p className="text-sm text-gray-500 overflow-hidden">
                {page.description}
              </p>
              <div className="mt-3 flex justify-between">
                <div className="flex items-center">
                  <Image
                    src={page.faviconUrl ?? ''}
                    alt="favicon"
                    width={16}
                    height={16}
                    className="w-[14px] h-[14px] mr-1"
                  />
                  <span className="text-sm">{page.domain}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400">
                    Recorded at {dayjs(page.date).format('YYYY/MM/DD')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 py-4 px-8 overflow-hidden h-4/5">
              <Skeleton active />
            </div>
          )}

          {page ? (
            <div className="w-[200px] flex justify-end">
              {page.imageUrl ? (
                <Image
                  width={0}
                  height={0}
                  src={page.imageUrl ?? ''}
                  alt={page.title}
                  className="rounded-r-lg object-scale-down"
                  style={{ height: '100%', width: 'auto', maxWidth: '200px' }}
                />
              ) : (
                <Skeleton.Image style={{ height: '100%', width: '200px' }} />
              )}
            </div>
          ) : (
            <Skeleton.Image
              active={true}
              style={{ height: '100%', width: '230px' }}
            />
          )}
        </div>
      </a>
    </>
  );
}
