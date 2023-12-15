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

const menuItems: MenuProps['items'] = [
  {
    label: <a href="/">Record</a>,
    key: 'record',
    icon: <EmergencyRecording />,
  },
  {
    label: <a href="/favs">List</a>,
    key: 'list',
    icon: <FormatListBulleted />,
  },
  {
    label: <a href="/search">Search</a>,
    key: 'search',
    icon: <Search />,
  },
  {
    label: <a href="/settings">Settings</a>,
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
