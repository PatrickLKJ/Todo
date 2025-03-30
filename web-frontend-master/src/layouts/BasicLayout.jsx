// ...existing code...
import { Layout, Menu } from 'antd';
// ...existing code...

const BasicLayout = (props) => {
  // ...existing code...
  
  return (
    <Layout className="basic-layout">
      <Layout.Header className="header page-transition">
        {/* ...existing code... */}
        <div className="logo-container">
          <div className="gradient-bg logo-bg">
            {/* 替换Logo */}
            <h1 className="logo-text">MyApp</h1>
          </div>
        </div>
      </Layout.Header>
      <Layout>
        <Layout.Sider 
          width={256} 
          className="modern-card site-layout-sider"
          breakpoint="lg"
          collapsible
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            className="page-transition"
          >
            {/* ...existing code... */}
          </Menu>
        </Layout.Sider>
        <Layout.Content className="site-layout-content page-transition">
          {props.children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
