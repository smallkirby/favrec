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
          className="group flex h-[100px] max-w-5xl cursor-pointer content-between justify-between
            overflow-hidden rounded-xl border border-slate-500/30 p-0 text-left
            shadow-2xl shadow-slate-900/40 backdrop-blur-sm transition-all duration-300 ease-in-out
            bg-gradient-to-br from-slate-800/60 via-slate-800/50 to-slate-900/60
            hover:border-pink-400/50 hover:shadow-pink-500/20 hover:shadow-2xl hover:-translate-y-1
            hover:bg-gradient-to-br hover:from-slate-700/70 hover:via-slate-700/60 hover:to-slate-800/70
            md:h-[140px]"
        >
          {page ? (
            <div
              className="flex h-full w-full flex-col justify-between overflow-hidden px-4 pb-3 pt-5
                text-left md:px-6 md:pb-4 md:pt-6"
            >
              <div className="overflow-hidden">
                <h3
                  className="mb-2 overflow-hidden text-ellipsis text-xs font-bold leading-tight text-slate-100 
                    group-hover:text-pink-100 transition-colors duration-300 md:text-lg md:leading-relaxed"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: page.description.length > 0 ? 1 : 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {page.title}
                </h3>
                <p
                  className="overflow-hidden text-ellipsis text-[0.625rem] leading-relaxed text-slate-300 
                    group-hover:text-slate-200 transition-colors duration-300 md:text-sm md:leading-relaxed"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {page.description}
                </p>
              </div>
              <div className="mt-2 flex shrink-0 items-center justify-between text-left text-[0.625rem] md:text-sm">
                <div className="flex items-center">
                  <div
                    className="mr-2 flex h-[16px] w-[16px] items-center justify-center rounded-md overflow-hidden 
                    ring-1 ring-slate-600/50 group-hover:ring-pink-400/50 transition-all duration-300 md:h-[20px] md:w-[20px] md:ring-2"
                  >
                    {page.faviconUrl && !imgNotFound ? (
                      <div className="flex h-full w-full items-center justify-center bg-white p-0.5 rounded-md shadow-lg">
                        <Image
                          src={page.faviconUrl}
                          alt="favicon"
                          width={14}
                          height={14}
                          className="h-[14px] w-[14px] object-contain md:h-[18px] md:w-[18px]"
                          onError={() => setImgNotFound(true)}
                        />
                      </div>
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center rounded-md text-white text-[0.5rem] font-bold 
                          shadow-inner md:text-xs"
                        style={{
                          background: `linear-gradient(135deg, ${getDomainColor(page.domain || '')}, ${getDomainColor(page.domain || '')}dd)`,
                        }}
                      >
                        {getDomainInitial(page.domain || '')}
                      </div>
                    )}
                  </div>
                  <span className="text-slate-300 font-medium group-hover:text-pink-200 transition-colors duration-300 md:text-sm">
                    {page.domain}
                  </span>
                </div>
                <div className="items-left">
                  <span className="mr-1 text-slate-400 font-medium group-hover:text-slate-300 transition-colors duration-300">
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
            <div className="h-[100px] w-[100px] shrink-0 md:h-[140px] md:w-[200px] overflow-hidden rounded-r-xl">
              {page.imageUrl && !imgNotFound ? (
                <Image
                  src={page.imageUrl}
                  alt={page.title}
                  className="group-hover:scale-105 transition-transform duration-300 ease-in-out"
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
