import { ConfigProvider, ThemeConfig, theme } from 'antd';

const darkTheme: Partial<ThemeConfig> = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#ff00ff',
    colorPrimaryHover: '#ab11ab',
  },
  components: {
    Menu: {
      itemBg: 'transparent',
    },
    Card: {
      colorBgContainer: '#1f293b',
    },
    Button: {
      colorTextDisabled: '#475569',
      borderColorDisabled: '#64748b',
    },
    Collapse: {
      contentBg: 'transparent',
      colorBorder: '#475569',
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
