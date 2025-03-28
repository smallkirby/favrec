'use client';

import { LoginOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Image, type MenuProps, Space, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { FirebaseAuthContext, logout } from '@/lib/firebase/auth';
import { FavConfigProvider } from '@/lib/theme';

export default function UserBadge() {
  const items: MenuProps['items'] = [];
  const router = useRouter();

  const menuLogin = {
    key: 'login',
    label: 'Login',
    icon: <LoginOutlined />,
    style: { marginTop: '8px' },
    onClick: () => router.push('/login'),
  };

  const menuLogout = {
    key: 'logout',
    label: <span className="text-gray-500">Logout</span>,
    icon: <LogoutOutlined />,
    style: { marginTop: '8px' },
    onClick: async () => {
      await logout();
      router.push('/');
    },
  };

  return (
    <FavConfigProvider>
      <FirebaseAuthContext.Consumer>
        {({ user }) => (
          <Dropdown menu={{ items: [...items, user ? menuLogout : menuLogin] }}>
            <Space wrap={true} size={16}>
              {user === undefined ? (
                <Spin size="large" />
              ) : (
                <Avatar
                  className="cursor-pointer"
                  size={40}
                  icon={
                    user?.photoUrl ? (
                      <Image
                        src={user.photoUrl}
                        alt={user.displayName || ''}
                        preview={false}
                        className="h-full w-full"
                      />
                    ) : (
                      <UserOutlined />
                    )
                  }
                />
              )}
            </Space>
          </Dropdown>
        )}
      </FirebaseAuthContext.Consumer>
    </FavConfigProvider>
  );
}
