import { Settings as LayoutSettings } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 苹果蓝
  colorPrimary: '#007AFF',
  layout: 'top',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Todo',
  pwa: false,
  logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  iconfontUrl: '',
  footerRender: false,
  headerHeight: 64,
  splitMenus: false,
  siderWidth: 208,
  menu: {
    locale: true,
  },
  header: {
    height: 64,
    padding: '0 24px',
  },
  pageTitle: false,
};

export default Settings;
