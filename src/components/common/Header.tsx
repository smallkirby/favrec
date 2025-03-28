'use client';

import FavoriteIcon from '@mui/icons-material/Favorite';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserBadge from '@/components/common/UserBadge';
import HeadMenu from './Menu';

export default function Header() {
  const router = useRouter();

  return (
    <header className="navbar mb-4">
      <div className="flex items-center justify-between px-4 pt-2">
        <Link href="/">
          <button
            type="button"
            className="group flex cursor-pointer items-center border-none bg-slate-800 py-0 font-cute
              text-pink-500 duration-300 hover:text-pink-800"
            onClick={() => router.push('/')}
          >
            <h1 className="mr-1 text-lg">FAVREC</h1>
            <FavoriteIcon
              sx={{ width: 20, height: 20 }}
              className="pb-[1px] group-hover:animate-ping"
            />
          </button>
        </Link>

        <div className="ml-8 hidden flex-1 pr-4 md:block">
          <HeadMenu />
        </div>

        <UserBadge />
      </div>

      <div className="mx-4 md:hidden">
        <HeadMenu />
      </div>
    </header>
  );
}
