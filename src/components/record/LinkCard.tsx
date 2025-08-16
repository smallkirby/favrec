'use client';

import { Skeleton } from 'antd';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useState } from 'react';
import type { FavRecord } from '@/types/FavRecord';

type Props = {
  page: FavRecord | null;
  onRemove: (url: string) => void;
};

export default function LinkCard({ page, onRemove }: Props) {
  const [imgNotFound, setImgNotFound] = useState(false);

  // Generate muted color based on domain
  const getDomainColor = (domain: string) => {
    let hash = 0;
    for (let i = 0; i < domain.length; i++) {
      hash = domain.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 30%, 35%)`;
  };

  const getDomainInitial = (domain: string) => {
    return domain.charAt(0).toUpperCase();
  };

  return (
    <>
      <a href={page?.url} target="_blank" className="w-full" rel="noreferrer">
        <div
          className="flex h-[100px] max-w-5xl cursor-pointer content-between justify-between
            overflow-hidden rounded-lg border-[1px] border-slate-600 bg-slate-800/50 p-0 text-left
            shadow-lg ring-1 ring-slate-600/20 backdrop-blur-sm duration-300 
            hover:border-slate-500 hover:bg-slate-700/70 hover:shadow-xl hover:ring-slate-500/30
            md:h-[140px]"
        >
          {page ? (
            <div
              className="flex h-full w-full flex-col justify-between overflow-hidden px-3 pb-2 pt-4
                text-left md:px-4 md:pb-3"
            >
              <div className="overflow-hidden">
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
                <p
                  className="overflow-hidden text-ellipsis text-[0.625rem] text-gray-400 md:text-sm"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {page.description}
                </p>
              </div>
              <div className="mt-3 flex shrink-0 items-center justify-between text-left text-[0.625rem]">
                <div className="flex items-center">
                  <div className="mr-2 flex h-[18px] w-[18px] items-center justify-center rounded-sm overflow-hidden">
                    {page.faviconUrl && !imgNotFound ? (
                      <div className="flex h-full w-full items-center justify-center bg-white p-0.5 ring-1 ring-slate-600/70 shadow-md shadow-slate-700/30 rounded-sm border border-slate-500/20">
                        <Image
                          src={page.faviconUrl}
                          alt="favicon"
                          width={17}
                          height={17}
                          className="h-[17px] w-[17px] object-contain"
                          onError={() => setImgNotFound(true)}
                        />
                      </div>
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center rounded-sm text-slate-200 text-xs font-medium"
                        style={{
                          backgroundColor: getDomainColor(page.domain || ''),
                        }}
                      >
                        {getDomainInitial(page.domain || '')}
                      </div>
                    )}
                  </div>
                  <span className="text-gray-400 md:text-sm">
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
            <div className="h-4/5 flex-1 overflow-hidden px-8 py-5">
              <Skeleton active={true} />
            </div>
          )}

          {page ? (
            <div className="h-[100px] w-[100px] shrink-0 md:h-[140px] md:w-[200px]">
              {page.imageUrl && !imgNotFound ? (
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
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    setImgNotFound(true);
                  }}
                />
              ) : (
                <Skeleton.Image className="h-[100px]! w-[100px]! md:h-[140px]! md:w-[200px]!" />
              )}
            </div>
          ) : (
            <Skeleton.Image
              active={true}
              style={{ height: '100%', width: '100px' }}
              className="h-[100px]! w-[100px]! md:h-[140px]! md:w-[200px]!"
            />
          )}
        </div>
      </a>
    </>
  );
}
