import React from 'react';
import { Row, Col, Card, Statistic, Typography, Button } from 'antd';
import { 
  RiseOutlined, 
  TeamOutlined, 
  FileOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Welcome = () => {
  return (
    <div className="welcome-page page-transition">
      <div className="gradient-bg welcome-header" style={{ padding: '30px', borderRadius: '8px', marginBottom: '24px' }}>
        <Title level={2} style={{ color: 'white', margin: 0 }}>欢迎使用管理系统</Title>
        <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
          您的现代化、高效率工作平台
        </Paragraph>
      </div>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="modern-card" hoverable>
            <Statistic 
              title="总用户" 
              value={1128} 
              prefix={<TeamOutlined />} 
              valueStyle={{ color: '#3a86ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="modern-card" hoverable>
            <Statistic 
              title="文件数量" 
              value={93} 
              prefix={<FileOutlined />} 
              valueStyle={{ color: '#8338ec' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="modern-card" hoverable>
            <Statistic 
              title="增长率" 
              value={15.6} 
              precision={1} 
              prefix={<RiseOutlined />} 
              suffix="%" 
              valueStyle={{ color: '#06d6a0' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="modern-card" hoverable>
            <Statistic 
              title="任务完成率" 
              value={86.2} 
              prefix={<ClockCircleOutlined />} 
              suffix="%" 
              valueStyle={{ color: '#ffbe0b' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={16}>
          <Card className="modern-card" title="快速入门">
            <Paragraph>
              通过左侧菜单可以快速访问系统的各项功能。如需帮助，请点击右上角的帮助按钮。
            </Paragraph>
            <Button type="primary" className="modern-button">开始使用</Button>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="modern-card" title="最近更新">
            <ul style={{ paddingLeft: '20px' }}>
              <li>新增数据分析功能</li>
              <li>优化用户界面体验</li>
              <li>修复已知问题</li>
              <li>提升系统响应速度</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Welcome;
