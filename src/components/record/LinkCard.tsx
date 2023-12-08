'use client';

import { FavRecord } from '@/types/FavRecord';
import { Skeleton } from 'antd';
import Image from 'next/image';
import dayjs from 'dayjs';

type Props = {
  page: FavRecord | null;
  onRemove: (url: string) => void;
};

export default function LinkCard({ page, onRemove }: Props) {
  return (
    <>
      <div
        className="border-[1px] border-gray-300 dark:border-slate-600 drop-shadow-md rounded-lg
            justify-between overflow-hidden
            p-0 w-full h-[100px] md:h-[140px] max-w-5xl cursor-pointer text-left
            flex content-between hover:shadow-lg duration-300"
      >
        {page ? (
          <div className="h-full pt-4 pb-2 px-3 md:px-4 text-left w-full flex justify-between flex-col overflow-hidden">
            <div className="overflow-hidden">
              <a href={page.url}>
                <h3
                  className="text-xs md:text-lg font-bold mb-2 overflow-hidden text-ellipsis"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: page.description.length > 0 ? 1 : 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {page.title}
                </h3>
              </a>
              <p
                className="text-[0.625rem] md:text-sm text-gray-400 overflow-hidden text-ellipsis"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {page.description}
              </p>
            </div>
            <div className="mt-3 flex justify-between text-left text-[0.625rem] items-center flex-shrink-0">
              <div className="flex items-center">
                <Image
                  src={page.faviconUrl ?? ''}
                  alt="favicon"
                  width={16}
                  height={16}
                  className="w-[14px] h-[14px] mr-1"
                />
                <span className="md:text-sm dark:text-gray-400">
                  {page.domain}
                </span>
              </div>
              <div className="items-left text-[0.625rem]">
                <span className="text-gray-400 mr-1">
                  {dayjs(page.date).format('YYYY/MM/DD')}
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
          <div className="w-[100px] md:w-[200px] h-[100px] md:h-[140px] shrink-0">
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
              <Skeleton.Image className="w-![100px] md:!w-[200px] !h-[100px] md:!h-[140px]" />
            )}
          </div>
        ) : (
          <Skeleton.Image
            active={true}
            style={{ height: '100%', width: '158px' }}
            className="!w-[100px] md:w-![158px] h-[100px] md:h-[140px]"
          />
        )}
      </div>
    </>
  );
}
