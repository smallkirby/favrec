'use client';

import UserBadge from '@/components/common/UserBadge';
import { useRouter } from 'next/navigation';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HeadMenu from './Menu';

export default function Header() {
  const router = useRouter();

  return (
    <header className="navbar m-4 flex items-center justify-between">
      <button
        className="flex cursor-pointer items-center border-none py-0 font-cute
        text-pink-500 duration-300 hover:text-pink-800 dark:bg-slate-800"
        onClick={() => router.push('/')}
      >
        <h1 className="mr-1 text-lg">FAVREC</h1>
        <FavoriteIcon sx={{ width: 20, height: 20 }} className="pb-[1px]" />
      </button>

      <div className="ml-8 flex-1">
        <HeadMenu />
      </div>

      <UserBadge />
    </header>
  );
}
