'use client';

import UserBadge from '@/components/common/UserBadge';
import { useRouter } from 'next/navigation';
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function Header() {
  const router = useRouter();

  return (
    <header className="navbar flex justify-between m-4 items-center">
      <button
        className="font-cute border-none bg-inherit cursor-pointer py-0 duration-300
        flex items-center text-pink-500 hover:text-pink-800"
        onClick={() => router.push('/')}
      >
        <h1 className="text-lg mr-1">FAVREC</h1>
        <FavoriteIcon sx={{ width: 20, height: 20 }} className="pb-[1px]" />
      </button>

      <UserBadge />
    </header>
  );
}
