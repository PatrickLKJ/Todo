import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import React from 'react';
import { FormattedMessage } from '@umijs/max';
import { getCurrentUser } from './services/api/authentication';
import 'moment/locale/zh-cn';
import moment from 'moment';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

moment.locale('zh-cn');

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentToken?: API.Token;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.Token | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      console.log('获取当前用户信息...');
      const token = localStorage.getItem('accessToken');
      console.log('当前localStorage中的token:', token);
      
      const userInfo = await getCurrentUser({
        skipErrorHandler: true,
      });
      
      console.log('获取到的用户信息:', userInfo);
      return userInfo;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 清除可能失效的token
      localStorage.removeItem('accessToken');
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentToken = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentToken,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    token: {
      colorBgAppListIconHover: 'rgba(0,0,0,0.06)',
      colorTextAppListIconHover: 'rgba(255,255,255,0.95)',
      colorTextAppListIcon: 'rgba(255,255,255,0.85)',
      sider: {
        colorBgCollapsedButton: '#fff',
        colorTextCollapsedButtonHover: 'rgba(0,0,0,0.65)',
        colorTextCollapsedButton: 'rgba(0,0,0,0.45)',
        colorMenuBackground: '#fff',
        colorBgMenuItemCollapsedHover: 'rgba(0,0,0,0.06)',
        colorBgMenuItemCollapsedSelected: 'rgba(0,0,0,0.15)',
        colorBgMenuItemCollapsedElevated: 'rgba(0,0,0,0.85)',
        colorMenuItemDivider: 'rgba(0,0,0,0.06)',
        colorBgMenuItemHover: 'rgba(0,0,0,0.06)',
        colorBgMenuItemSelected: 'rgba(0,122,255,0.1)',
        colorTextMenuSelected: '#007AFF',
        colorTextMenuItemHover: '#007AFF',
        colorTextMenu: 'rgba(0,0,0,0.85)',
        colorTextMenuSecondary: 'rgba(0,0,0,0.65)',
        colorTextMenuTitle: 'rgba(0,0,0,0.85)',
        colorTextMenuActive: '#007AFF',
        colorTextSubMenuSelected: '#007AFF',
      },
      header: {
        colorBgHeader: '#fff',
        colorHeaderTitle: '#1d1d1f',
        colorTextMenu: 'rgba(0,0,0,0.85)',
        colorTextMenuSecondary: 'rgba(0,0,0,0.65)',
        colorTextMenuSelected: '#007AFF',
        colorBgMenuItemSelected: 'rgba(0,122,255,0.1)',
      },
    },
    rightContentRender: () => <RightContent />,
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      if (!initialState?.currentToken && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    layoutBgImgList: [],
    links: isDev
      ? [
          <a key="openapi" href="http://localhost:8080/swagger-ui.html" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </a>,
        ]
      : [],
    menuHeaderRender: undefined,
    childrenRender: (children) => {
      return (
        <>
          {children}
          <SettingDrawer
            disableUrlParams
            enableDarkTheme
            settings={initialState?.settings}
            onSettingChange={(settings) => {
              setInitialState((preInitialState) => ({
                ...preInitialState,
                settings,
              }));
            }}
          />
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};
