import { ConfigProvider, ThemeConfig, theme } from 'antd';

const darkTheme: Partial<ThemeConfig> = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#ff00ff',
  },
  components: {
    Menu: {
      itemBg: 'transparent',
    },
    Card: {
      colorBgContainer: '#1f293b',
    },
  },
};

export const FavConfigProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <ConfigProvider theme={darkTheme}>{children}</ConfigProvider>;
};
