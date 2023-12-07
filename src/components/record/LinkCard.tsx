'use client';

import { FavRecord } from '@/types/FavRecord';
import { Skeleton } from 'antd';
import Image from 'next/image';

type Props = {
  page: FavRecord | null;
};

export default function LinkCard({ page }: Props) {
  return (
    <>
      <a href={page?.url ?? ''}>
        <div
          className="border-[1px] border-gray-300 drop-shadow-md rounded-lg
            h-[128px] p-0 max-w-5xl cursor-pointer flex content-between hover:shadow-lg duration-300"
        >
          {page ? (
            <div className="flex-1 h-full py-4 px-8">
              <h3 className="text-lg font-bold mb-2">{page.title}</h3>
              <p className="text-sm text-gray-500">{page.description}</p>
              <div className="flex mt-3">
                <Image
                  src={page.faviconUrl ?? ''}
                  alt="favicon"
                  width={16}
                  height={16}
                  className="mr-1"
                />
                <span className="text-sm">{page.domain}</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 py-4 px-8 overflow-hidden h-4/5">
              <Skeleton active />
            </div>
          )}

          {page ? (
            <div className="max-w-[230px] h-full relative w-[230px]">
              <Image
                fill
                src={page.imageUrl ?? ''}
                alt={page.title}
                className="rounded-r-lg shadow-md"
                objectFit="cover"
              />
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
