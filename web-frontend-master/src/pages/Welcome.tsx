import { PageContainer } from '@ant-design/pro-components';
import { useModel, history } from '@umijs/max';
import { 
  Card, Button, Space, Typography, Row, Col, Avatar, List, Tag, Progress, 
  Empty, Tooltip, Divider, Statistic, Badge, Spin, Timeline, Calendar
} from 'antd';
import { 
  CheckCircleOutlined, CalendarOutlined, TeamOutlined, ClockCircleOutlined,
  FileTextOutlined, RocketOutlined, FireOutlined, BulbOutlined,
  TrophyOutlined, StarOutlined, PlusOutlined, BarChartOutlined,
  UnorderedListOutlined, AppstoreOutlined, SettingOutlined, BookOutlined
} from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { getTasksByPage } from '@/services/api/task';

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

// 使用技巧组件
const TipCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}> = ({ icon, title, description, color }) => {
  return (
    <Card
      style={{
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        height: '100%',
        overflow: 'hidden',
        transition: 'all 0.3s'
      }}
      hoverable
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px'
      }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${color}33 0%, ${color}66 100%)`,
            color: color,
            fontSize: '24px',
            flexShrink: 0
          }}
        >
          {icon}
        </div>
        <div>
          <Title level={5} style={{ marginTop: 0, marginBottom: '8px' }}>
            {title}
          </Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            {description}
          </Text>
        </div>
      </div>
    </Card>
  );
};

// 进度展示组件
const ProgressCard: React.FC<{
  title: string;
  percent: number;
  color: string;
}> = ({ title, percent, color }) => {
  return (
    <Card
      style={{
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        height: '100%',
        textAlign: 'center',
        padding: '0'
      }}
      bodyStyle={{ padding: '24px 16px' }}
    >
      <Progress
        type="dashboard"
        percent={percent}
        strokeColor={color}
        width={120}
        format={percent => `${percent}%`}
      />
      <Title level={5} style={{ marginTop: '16px', marginBottom: '0' }}>
        {title}
      </Title>
    </Card>
  );
};

// 任务项组件
const TaskItem: React.FC<{
  task: API.Task;
  onClick: () => void;
}> = ({ task, onClick }) => {
  // 获取优先级颜色
  const getPriorityColor = (priority: string = 'medium') => {
    switch(priority) {
      case 'high': return '#f5222d';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#faad14';
    }
  };
  
  // 计算截止日期状态
  const today = moment().format('YYYY-MM-DD');
  const isDueToday = task.dueDate === today;
  const isOverdue = !task.completed && task.dueDate && task.dueDate < today;
  
  return (
    <div 
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        background: task.completed ? '#f9f9f9' : 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
      }}
      onClick={onClick}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{ 
          fontWeight: 'bold',
          textDecoration: task.completed ? 'line-through' : 'none',
          color: task.completed ? '#8c8c8c' : 'inherit',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {task.title}
        </div>
        {task.completed ? (
          <Badge status="success" text="已完成" />
        ) : isOverdue ? (
          <Badge status="error" text="已逾期" />
        ) : isDueToday ? (
          <Badge status="warning" text="今日" />
        ) : (
          <Badge status="processing" text="进行中" />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size={4}>
          {task.category && (
            <Tag color="blue" style={{ margin: 0 }}>
              {task.category === 'work' ? '工作' : 
               task.category === 'study' ? '学习' : 
               task.category === 'life' ? '生活' : '其他'}
            </Tag>
          )}
          {task.dueDate && (
            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {moment(task.dueDate).format('MM-DD')}
            </span>
          )}
        </Space>
        <Tag color={getPriorityColor(task.priority)} style={{ margin: 0, opacity: 0.8 }}>
          {task.priority === 'high' ? '高' : 
           task.priority === 'medium' ? '中' : '低'}
        </Tag>
      </div>
    </div>
  );
};

const Welcome: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const username = initialState?.currentToken?.userName || '用户';
  const currentUserId = initialState?.currentToken?.userId;
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<API.Task[]>([]);
  
  // 获取任务数据
  useEffect(() => {
    if (currentUserId) {
      setLoading(true);
      getTasksByPage({ pageNum: 1, pageSize: 20, userId: currentUserId })
        .then(res => {
          if (res && res.list) {
            setTasks(res.list);
          }
        })
        .catch(err => {
          console.error('获取任务数据失败:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentUserId]);
  
  // 任务统计数据
  const today = moment().format('YYYY-MM-DD');
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const upcomingTasks = tasks.filter(task => !task.completed && task.dueDate && task.dueDate > today).length;
  const overdueTasks = tasks.filter(task => !task.completed && task.dueDate && task.dueDate < today).length;
  const todayTasks = tasks.filter(task => task.dueDate === today).length;
  
  // 按优先级统计
  const highPriorityTasks = tasks.filter(task => task.priority === 'high' && !task.completed).length;
  
  // 最近任务 - 取未完成的5个任务
  const recentTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    })
    .slice(0, 5);
  
  // 最近完成的任务
  const recentCompletedTasks = tasks
    .filter(task => task.completed)
    .slice(0, 3);
  
  // 点击创建新任务按钮
  const handleCreateTask = () => {
    history.push('/task?action=create');
  };

  // 点击查看全部任务按钮
  const handleViewAllTasks = () => {
    history.push('/task');
  };
  
  // 点击任务项
  const handleTaskClick = (task: API.Task) => {
    history.push('/task');
  };

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
            padding: '40px 40px 100px 40px',
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
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Title level={2} style={{ color: '#fff', marginBottom: '8px' }}>
                  早上好，{username}！
                </Title>
                <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '16px', marginBottom: '24px' }}>
                  {highPriorityTasks > 0 ? `您有 ${highPriorityTasks} 个高优先级任务待处理` : '今天没有紧急任务，保持好状态！'}
                </Paragraph>
                <Space size="middle">
                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={handleCreateTask}
                    icon={<PlusOutlined />}
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
                    onClick={handleViewAllTasks}
                    icon={<UnorderedListOutlined />}
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
              
              <div style={{ 
                textAlign: 'center', 
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '16px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                display: 'flex'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                  {moment().format('HH:mm')}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {moment().format('YYYY年MM月DD日')}
                </div>
                <div style={{ marginTop: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  {moment().format('dddd')}
                </div>
              </div>
            </div>
          </div>
          
          {/* 数据统计卡片行 */}
          <Row gutter={[24, 24]} style={{ marginTop: '-60px' }}>
            <Col xs={12} sm={6} lg={6}>
              <Card
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}
              >
                <Statistic 
                  title={<span style={{ fontSize: '14px' }}><UnorderedListOutlined /> 全部任务</span>}
                  value={totalTasks} 
                  valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={6}>
              <Card
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}
              >
                <Statistic 
                  title={<span style={{ fontSize: '14px' }}><CheckCircleOutlined /> 已完成</span>}
                  value={completedTasks} 
                  valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                  suffix={<small style={{ fontSize: '14px', color: '#8c8c8c' }}> / {totalTasks}</small>}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={6}>
              <Card
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}
              >
                <Statistic 
                  title={<span style={{ fontSize: '14px' }}><CalendarOutlined /> 今日任务</span>}
                  value={todayTasks} 
                  valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={6}>
              <Card
                style={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}
              >
                <Statistic 
                  title={<span style={{ fontSize: '14px' }}><ClockCircleOutlined /> 已逾期</span>}
                  value={overdueTasks} 
                  valueStyle={{ color: overdueTasks > 0 ? '#ff4d4f' : '#8c8c8c', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>
        </Card>
        
        {/* 主要内容区 */}
        <Row gutter={[24, 24]}>
          {/* 左侧内容 */}
          <Col xs={24} lg={16}>
            {/* 最近任务 */}
            <Card
              title={<span><FileTextOutlined /> 即将到期任务</span>}
              extra={<a onClick={handleViewAllTasks}>查看全部</a>}
              style={{
                borderRadius: '16px',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <Spin spinning={loading}>
                {recentTasks.length > 0 ? (
                  <div>
                    {recentTasks.map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        onClick={() => handleTaskClick(task)} 
                      />
                    ))}
                  </div>
                ) : (
                  <Empty 
                    description="没有找到待办任务" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Spin>
            </Card>
            
            {/* 进度展示 */}
            <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={8}>
                <ProgressCard 
                  title="总体完成率" 
                  percent={completionRate} 
                  color="#1890ff" 
                />
              </Col>
              <Col xs={24} sm={8}>
                <ProgressCard 
                  title="本周进度" 
                  percent={Math.min(Math.round(moment().day() * 100 / 7), 100)} 
                  color="#52c41a" 
                />
              </Col>
              <Col xs={24} sm={8}>
                <ProgressCard 
                  title="今日完成" 
                  percent={75} 
                  color="#faad14" 
                />
              </Col>
            </Row>
            
            {/* 使用技巧 */}
            <Card
              title={<span><BulbOutlined /> 使用技巧</span>}
              style={{
                borderRadius: '16px',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <TipCard 
                    icon={<RocketOutlined />}
                    title="快速创建任务"
                    description="使用快捷键 Ctrl+N 可以快速创建新任务，无需鼠标点击"
                    color="#1890ff"
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <TipCard 
                    icon={<FireOutlined />}
                    title="专注时钟"
                    description="使用番茄工作法增强效率，每25分钟休息5分钟"
                    color="#ff4d4f"
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <TipCard 
                    icon={<AppstoreOutlined />}
                    title="多视图模式"
                    description="表格、看板和日历视图满足不同场景需求"
                    color="#faad14"
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <TipCard 
                    icon={<SettingOutlined />}
                    title="个性化设置"
                    description="根据自己的习惯定制任务类别和优先级"
                    color="#52c41a"
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          
          {/* 右侧内容 */}
          <Col xs={24} lg={8}>
            {/* 本月日历 */}
            <Card
              title={<span><CalendarOutlined /> 月度一览</span>}
              style={{
                borderRadius: '16px',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
              bodyStyle={{ padding: '0 0 24px 0' }}
            >
              <Calendar 
                fullscreen={false} 
                headerRender={() => null}
              />
            </Card>
            
            {/* 最近完成 */}
            <Card
              title={<span><TrophyOutlined /> 最近完成</span>}
              style={{
                borderRadius: '16px',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <Spin spinning={loading}>
                {recentCompletedTasks.length > 0 ? (
                  <Timeline>
                    {recentCompletedTasks.map(task => (
                      <Timeline.Item 
                        key={task.id} 
                        color="green" 
                        dot={<CheckCircleOutlined style={{ fontSize: '16px' }} />}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{task.title}</div>
                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                              {task.category === 'work' ? '工作' : 
                               task.category === 'study' ? '学习' : 
                               task.category === 'life' ? '生活' : '其他'}
                            </div>
                          </div>
                          <Tag color="green">已完成</Tag>
                        </div>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Empty 
                    description="暂无完成记录" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Spin>
            </Card>
            
            {/* 快速链接 */}
            <Card
              title={<span><StarOutlined /> 快速访问</span>}
              style={{
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <Button 
                  icon={<PlusOutlined />} 
                  onClick={handleCreateTask}
                  style={{ minWidth: '120px' }}
                >
                  新建任务
                </Button>
                <Button 
                  icon={<UnorderedListOutlined />} 
                  onClick={handleViewAllTasks}
                  style={{ minWidth: '120px' }}
                >
                  任务列表
                </Button>
                <Button 
                  icon={<AppstoreOutlined />}
                  onClick={() => history.push('/task')}
                  style={{ minWidth: '120px' }}
                >
                  看板视图
                </Button>
                <Button 
                  icon={<CalendarOutlined />}
                  onClick={() => history.push('/task')}
                  style={{ minWidth: '120px' }}
                >
                  日历视图
                </Button>
                <Button 
                  icon={<BarChartOutlined />}
                  onClick={() => history.push('/task')}
                  style={{ minWidth: '120px' }}
                >
                  数据分析
                </Button>
                <Button 
                  icon={<BookOutlined />}
                  onClick={() => window.open('https://github.com/PatrickLKJ/Todo', '_blank')}
                  style={{ minWidth: '120px' }}
                >
                  帮助文档
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default Welcome;
