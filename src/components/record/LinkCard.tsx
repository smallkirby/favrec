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
        className="flex h-[100px] w-full max-w-5xl cursor-pointer
            content-between justify-between
            overflow-hidden rounded-lg border-[1px] border-gray-300 p-0 text-left drop-shadow-md
            duration-300 hover:shadow-lg dark:border-slate-600 md:h-[140px]"
      >
        {page ? (
          <div
            className="flex h-full w-full flex-col justify-between overflow-hidden
            px-3 pb-2 pt-4 text-left md:px-4 md:pb-3"
          >
            <div className="overflow-hidden">
              <a href={page.url}>
                <h3
                  className="mb-2 overflow-hidden text-ellipsis text-xs font-bold md:text-lg"
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
                className="overflow-hidden text-ellipsis text-[0.625rem] text-gray-400 md:text-sm "
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {page.description}
              </p>
            </div>
            <div className="mt-3 flex flex-shrink-0 items-center justify-between text-left text-[0.625rem]">
              <div className="flex items-center">
                <Image
                  src={page.faviconUrl ?? ''}
                  alt="favicon"
                  width={16}
                  height={16}
                  className="mr-1 h-[14px] w-[14px]"
                />
                <span className="dark:text-gray-400 md:text-sm">
                  {page.domain}
                </span>
              </div>
              <div className="items-left text-[0.625rem]">
                <span className="mr-1 text-gray-400">
                  {dayjs(page.date).format('YYYY/MM/DD')}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-4/5 flex-1 overflow-hidden px-8 py-4">
            <Skeleton active />
          </div>
        )}

        {page ? (
          <div className="h-[100px] w-[100px] shrink-0 md:h-[140px] md:w-[200px]">
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
              <Skeleton.Image className="!h-[100px] !w-[100px] md:!h-[140px] md:!w-[200px]" />
            )}
          </div>
        ) : (
          <Skeleton.Image
            active={true}
            style={{ height: '100%', width: '158px' }}
            className="md:w-![158px] h-[100px] !w-[100px] md:h-[140px]"
          />
        )}
      </div>
    </>
  );
}
