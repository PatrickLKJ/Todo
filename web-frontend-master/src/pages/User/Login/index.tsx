import Footer from '@/components/Footer';
import { LockOutlined, UserOutlined, CheckCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { FormattedMessage, history, SelectLang, useIntl, useModel, Helmet } from '@umijs/max';
import { message, Typography } from 'antd';
import Settings from '../../../../config/defaultSettings';
import React from 'react';
import { flushSync } from 'react-dom';
import { login } from '@/services/api/authentication';

const { Title, Paragraph } = Typography;

const Lang = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });

  return (
    <div className={langClassName} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const Login: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
      backgroundSize: '100% 100%',
    };
  });
  
  const loginCardClass = useEmotionCss(() => {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      padding: '40px 30px',
      maxWidth: '450px',
      width: '100%',
      margin: '0 auto',
    };
  });
  
  const titleClass = useEmotionCss(() => {
    return {
      color: '#1890ff',
      fontWeight: 'bold',
      fontSize: '28px',
      textAlign: 'center',
      marginBottom: '20px',
    };
  });
  
  const subtitleClass = useEmotionCss(() => {
    return {
      color: '#666',
      fontSize: '16px',
      textAlign: 'center',
      marginBottom: '30px',
    };
  });

  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentToken: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      console.log('登录表单提交，数据:', values);
      // 登录
      const response = await login({
        userId: values.username,
        password: values.password,
      });
      console.log('登录API响应:', response);

      // 修改判断逻辑：检查响应中是否有accessToken字段
      if (response && response.accessToken) {
        const defaultLoginSuccessMessage = '登录成功！准备开始您的任务管理之旅';
        message.success(defaultLoginSuccessMessage);
        
        // 保存登录凭证
        localStorage.setItem('accessToken', response.accessToken);
        console.log('保存token到localStorage:', response.accessToken);
        
        // 登录成功后进行重定向
        const urlParams = new URL(window.location.href).searchParams;
        const redirect = urlParams.get('redirect');
        
        // 使用直接跳转替代history.push
        window.location.href = redirect || '/';
        return;
      }
      
      // 登录失败
      message.error(response?.message || '登录失败，请重试！');
      console.error('登录失败:', response?.message);
    } catch (error) {
      const defaultLoginFailureMessage = '登录失败，请重试！';
      console.error('登录请求异常:', error);
      message.error(defaultLoginFailureMessage);
    }
  };

  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          登录 - TodoList
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className={loginCardClass}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '60px', marginBottom: '10px', color: '#1890ff' }}>
              <CheckCircleOutlined style={{ marginRight: '10px' }} />
              <CalendarOutlined />
            </div>
            <div className={titleClass}>TodoList</div>
            <div className={subtitleClass}>规划、跟踪、完成——掌控每一个任务</div>
          </div>
          
          <LoginForm
            contentStyle={{
              minWidth: 280,
              maxWidth: '100%',
            }}
            submitter={{
              searchConfig: {
                submitText: '登录并开始规划',
              },
              submitButtonProps: {
                size: 'large',
                style: {
                  width: '100%',
                  height: '46px',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #1890ff 0%, #52c41a 100%)',
                },
              },
            }}
            initialValues={{
              autoLogin: true,
            }}
            onFinish={async (values) => {
              await handleSubmit(values);
            }}
          >
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined />,
              }}
              placeholder="请输入用户名"
              rules={[
                {
                  required: true,
                  message: "请输入用户名",
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
              }}
              placeholder="请输入密码"
              rules={[
                {
                  required: true,
                  message: "请输入密码",
                },
              ]}
            />

            <div
              style={{
                marginBottom: 24,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <ProFormCheckbox noStyle name="autoLogin">
                记住我
              </ProFormCheckbox>
              <a
                style={{
                  color: '#1890ff',
                }}
              >
                忘记密码
              </a>
            </div>
            
            <div style={{ marginTop: '20px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
              <p>开始管理您的任务，提高工作效率</p>
            </div>
          </LoginForm>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
