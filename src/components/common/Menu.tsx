import {
  EmergencyRecording,
  FormatListBulleted,
  Search,
  Settings,
} from '@mui/icons-material';
import { useState } from 'react';
import { Menu, MenuProps } from 'antd';
import { usePathname } from 'next/navigation';
import { FavConfigProvider } from '@/lib/theme';
import Link from 'next/link';

const menuItems: MenuProps['items'] = [
  {
    label: <Link href="/">Record</Link>,
    key: 'record',
    icon: <EmergencyRecording />,
  },
  {
    label: <Link href="/favs">List</Link>,
    key: 'list',
    icon: <FormatListBulleted />,
  },
  {
    label: <Link href="/search">Search</Link>,
    key: 'search',
    icon: <Search />,
  },
  {
    label: <Link href="/settings">Settings</Link>,
    key: 'settings',
    icon: <Settings />,
  },
];

const getSelectedKey = (pathname: string) => {
  const key = pathname.split('/')[1];
  switch (key) {
    case 'record':
    case '':
      return 'record';
    case 'favs':
      return 'list';
    case 'settings':
      return 'settings';
    case 'search':
      return 'search';
    default:
      return '';
  }
};

export default function HeadMenu() {
  const pathname = usePathname();
  const [current, setCurrent] = useState(getSelectedKey(pathname));

  return (
    <FavConfigProvider>
      <Menu
        onClick={(e) => setCurrent(e.key)}
        selectedKeys={[current]}
        items={menuItems}
        mode="horizontal"
        className="justify-center md:justify-start"
      />
    </FavConfigProvider>
  );
}
