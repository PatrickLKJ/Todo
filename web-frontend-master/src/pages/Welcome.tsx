import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, Button, Space, Typography, Row, Col } from 'antd';
import { CheckCircleOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import React from 'react';

const { Title, Paragraph, Text } = Typography;

/**
 * 功能卡片组件
 */
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}> = ({ icon, title, description, color }) => {
  return (
    <Card 
      style={{ 
        height: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        border: 'none',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease'
      }}
      bodyStyle={{
        padding: '24px',
        height: '100%'
      }}
      hoverable
    >
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        <div 
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
            boxShadow: `0 8px 16px ${color}30`
          }}
        >
          {icon}
        </div>
        <Title level={4} style={{ marginTop: 0, marginBottom: '12px' }}>
          {title}
        </Title>
        <Paragraph style={{ 
          color: 'rgba(0, 0, 0, 0.65)',
          flex: 1,
          marginBottom: '16px'
        }}>
          {description}
        </Paragraph>
      </div>
    </Card>
  );
};

/**
 * 数据统计卡片
 */
const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => {
  return (
    <Card
      style={{ 
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        height: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
            color: '#fff',
            fontSize: '20px'
          }}
        >
          {icon}
        </div>
        <div>
          <Text style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}>{title}</Text>
          <Title level={3} style={{ margin: '0' }}>{value}</Title>
        </div>
      </div>
    </Card>
  );
};

const Welcome: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const username = initialState?.currentToken?.userName || '用户';

  return (
    <PageContainer
      header={{
        title: null,
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* 顶部欢迎卡片 */}
        <Card
          style={{
            borderRadius: '24px',
            marginBottom: '24px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden'
          }}
        >
          <div style={{
            background: 'linear-gradient(120deg, #6A9EEE 0%, #4657C4 100%)',
            margin: '-24px',
            padding: '40px 40px 140px 40px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* 装饰圆形 */}
            <div style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              top: '-100px',
              right: '-50px'
            }} />
            <div style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              bottom: '-50px',
              left: '10%'
            }} />
            
            <Title level={2} style={{ color: '#fff', marginBottom: '8px' }}>
              您好，{username}！
            </Title>
            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '16px', marginBottom: '24px' }}>
              欢迎使用 Todo 任务管理系统，这里是您的个人工作空间
            </Paragraph>
            <Space size="middle">
              <Button 
                type="primary" 
                size="large" 
                style={{ 
                  background: 'white', 
                  borderColor: 'white',
                  color: '#4657C4',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                }}
              >
                创建新任务
              </Button>
              <Button 
                size="large" 
                style={{ 
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  borderRadius: '8px',
                  background: 'transparent',
                }}
              >
                查看全部任务
              </Button>
            </Space>
          </div>
          
          {/* 数据统计卡片行 */}
          <Row gutter={[24, 24]} style={{ marginTop: '-80px' }}>
            <Col xs={24} sm={12} lg={8}>
              <StatCard 
                title="待办任务" 
                value="12" 
                icon={<CheckCircleOutlined />}
                color="#FF6B6B" 
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard 
                title="今日待完成" 
                value="5" 
                icon={<CalendarOutlined />}
                color="#4DC9A1" 
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard 
                title="团队共享" 
                value="3" 
                icon={<TeamOutlined />}
                color="#FFB038" 
              />
            </Col>
          </Row>
        </Card>
        
        {/* 功能介绍部分 */}
        <Title level={3} style={{ marginTop: '8px', marginBottom: '24px' }}>
          功能介绍
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <FeatureCard
              icon={<CheckCircleOutlined style={{ fontSize: '30px', color: '#fff' }} />}
              title="任务管理"
              description="高效管理您的任务，设置优先级、截止日期和提醒，让您的工作井然有序。"
              color="#4657C4"
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <FeatureCard
              icon={<CalendarOutlined style={{ fontSize: '30px', color: '#fff' }} />}
              title="日程安排"
              description="通过日历视图查看和安排任务，轻松掌握每日、每周和每月的工作计划。"
              color="#FF6B6B"
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <FeatureCard
              icon={<TeamOutlined style={{ fontSize: '30px', color: '#fff' }} />}
              title="团队协作"
              description="与团队成员共享任务和项目，分配责任人，实时跟踪进度，提高团队协作效率。"
              color="#FFB038"
            />
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default Welcome;
