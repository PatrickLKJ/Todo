import React, { useRef, useState, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { 
  Button, Tag, Popconfirm, message, Card, Row, Col, Statistic, Space, 
  Progress, Badge, Tabs, Input, Empty, Dropdown, Menu, Tooltip, Avatar,
  Calendar, List, Typography, Spin, Modal, Skeleton, Radio
} from 'antd';
import { 
  PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined,
  AppstoreOutlined, UnorderedListOutlined, FilterOutlined, SearchOutlined,
  SyncOutlined, StarOutlined, ArrowUpOutlined, ArrowDownOutlined,
  EditOutlined, DeleteOutlined, ClockCircleOutlined, FireOutlined,
  DragOutlined, ThunderboltOutlined, EyeOutlined, ShareAltOutlined,
  PrinterOutlined, BarChartOutlined, InfoCircleOutlined, SettingOutlined,
  BellOutlined, PushpinOutlined, TagOutlined, FlagOutlined
} from '@ant-design/icons';
import { getTasksByPage as listTasksByPage, deleteTask, updateTask } from '@/services/api/task';
import { useModel, history } from 'umi';
import TaskForm from './components/TaskForm';
import { convertPageData } from '@/utils/request';
import moment from 'moment';
import type { Moment } from 'moment';
import type { Dayjs } from 'dayjs';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { MenuProps } from 'antd';

const { Search } = Input;
const { Title, Paragraph, Text } = Typography;

// 定义简化的图表组件，避免使用@ant-design/charts
const SimpleCharts = {
  Pie: ({ data }: { data: Array<{ type: string; value: number }> }) => (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {data.map((item, index) => {
          const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d'];
          const percent = data.reduce((sum, d) => sum + d.value, 0) === 0 
            ? 0 
            : Math.round((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100);
          
          return (
            <div key={index} style={{ margin: '10px', textAlign: 'center' }}>
              <Progress 
                type="circle" 
                percent={percent} 
                strokeColor={colors[index % colors.length]} 
                format={() => item.value}
                width={80}
              />
              <div style={{ marginTop: '10px' }}>{item.type}: {percent}%</div>
            </div>
          );
        })}
      </div>
    </div>
  ),
  
  Column: ({ data }: { data: Array<{ type: string; value: number }> }) => (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', height: '200px', alignItems: 'flex-end', justifyContent: 'space-around' }}>
        {data.map((item, index) => {
          const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d'];
          const maxValue = Math.max(...data.map(d => d.value), 1);
          const height = `${(item.value / maxValue) * 100}%`;
          
          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                style={{ 
                  width: '40px', 
                  height, 
                  backgroundColor: colors[index % colors.length],
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '4px 4px 0 0'
                }}
              >
                {item.value > 0 ? item.value : ''}
              </div>
              <div style={{ marginTop: '10px' }}>{item.type}</div>
            </div>
          );
        })}
      </div>
    </div>
  )
};

// 可拖拽的任务卡片包装组件
const SortableTaskCard = ({ task, onEdit, onToggle, onDelete }: { 
  task: API.Task; 
  onEdit: (task: API.Task) => void; 
  onToggle: (task: API.Task) => void; 
  onDelete: (id: number) => void; 
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: String(task.id) });
  
  // 计算截止日期状态
  const today = moment().format('YYYY-MM-DD');
  const isDueToday = task.dueDate === today;
  const isOverdue = !task.completed && task.dueDate && task.dueDate < today;
  const isUpcoming = !task.completed && task.dueDate && task.dueDate > today;
  
  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return '#f5222d';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#faad14';
    }
  };
  
  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'work': return <PushpinOutlined />;
      case 'study': return <ClockCircleOutlined />;
      case 'life': return <TagOutlined />;
      case 'other': return <FlagOutlined />;
      default: return <TagOutlined />;
    }
  };
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card 
        size="small"
        hoverable
        style={{ 
          marginBottom: 16,
          borderRadius: '12px',
          borderLeft: `3px solid ${getPriorityColor(task.priority || 'medium')}`,
          opacity: task.completed ? 0.8 : 1,
          cursor: 'move',
          boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
          transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
          overflow: 'hidden',
          background: task.completed ? 'rgba(245, 245, 245, 0.7)' : 'white',
        }}
        bodyStyle={{
          padding: '16px',
        }}
        actions={[
          <Tooltip key="edit" title="编辑">
            <EditOutlined onClick={(e) => {
              if (e) e.stopPropagation();
              onEdit(task);
            }} />
          </Tooltip>,
          <Tooltip key="toggle" title={task.completed ? "取消完成" : "标记完成"}>
            {task.completed ? 
              <CloseCircleOutlined onClick={(e) => {
                if (e) e.stopPropagation();
                onToggle(task);
              }} /> : 
              <CheckCircleOutlined style={{ color: '#52c41a' }} onClick={(e) => {
                if (e) e.stopPropagation();
                onToggle(task);
              }} />
            }
          </Tooltip>,
          <Tooltip key="delete" title="删除">
            <Popconfirm
              title="确定删除此任务吗?"
              onConfirm={(e) => {
                if (e) e.stopPropagation();
                onDelete(task.id!);
              }}
            >
              <DeleteOutlined style={{ color: '#ff4d4f' }} onClick={(e) => e && e.stopPropagation()} />
            </Popconfirm>
          </Tooltip>,
        ]}
      >
        <div onClick={() => onEdit(task)}>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: 16, 
              flex: 1,
              textDecoration: task.completed ? 'line-through' : 'none',
              color: task.completed ? '#8c8c8c' : 'inherit',
            }}>
              {task.title}
            </div>
            <Space align="start" style={{ marginLeft: 8 }}>
              {task.category && (
                <Tag color="blue" icon={getCategoryIcon(task.category)}>
                  {task.category === 'work' ? '工作' : 
                   task.category === 'study' ? '学习' : 
                   task.category === 'life' ? '生活' : '其他'}
                </Tag>
              )}
              {task.completed && (
                <Tag color="green" icon={<CheckCircleOutlined />}>已完成</Tag>
              )}
            </Space>
          </div>
          
          {task.description && (
            <div style={{ 
              marginBottom: 12, 
              color: task.completed ? '#8c8c8c' : '#666', 
              maxHeight: '60px', 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {task.description}
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space wrap size={4}>
              {task.dueDate && (
                <Tag
                  icon={<CalendarOutlined />}
                  color={isOverdue ? 'error' : isDueToday ? 'warning' : 'default'}
                >
                  {moment(task.dueDate).format('YYYY-MM-DD')}
                  {isOverdue && ' (已逾期)'}
                  {isDueToday && ' (今日)'}
                </Tag>
              )}
              <Tag color={getPriorityColor(task.priority || 'medium')} style={{ opacity: 0.8 }}>
                {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}优先级
              </Tag>
            </Space>
            
            <div style={{ 
              color: '#8c8c8c', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <DragOutlined style={{ marginLeft: 8 }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// 统计卡片组件
const StatisticsCards = ({ taskStats }: { taskStats: { total: number; completed: number; upcoming: number; overdue: number } }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      <Col xs={12} sm={6}>
        <Card
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
            height: '100%',
            border: 'none',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #1890ff11 0%, #1890ff22 100%)',
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ marginBottom: 8, fontSize: 14, color: 'rgba(0, 0, 0, 0.45)' }}>总任务数</div>
              <div style={{ fontSize: 30, fontWeight: 'bold', color: '#1890ff', lineHeight: 1 }}>{taskStats.total}</div>
            </div>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '25px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#1890ff',
              color: '#fff',
              fontSize: '24px'
            }}>
              <UnorderedListOutlined />
            </div>
          </div>
        </Card>
      </Col>
      
      <Col xs={12} sm={6}>
        <Card
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
            height: '100%',
            border: 'none',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #52c41a11 0%, #52c41a22 100%)',
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ marginBottom: 8, fontSize: 14, color: 'rgba(0, 0, 0, 0.45)' }}>已完成</div>
              <div style={{ fontSize: 30, fontWeight: 'bold', color: '#52c41a', lineHeight: 1 }}>{taskStats.completed}</div>
            </div>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '25px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#52c41a',
              color: '#fff',
              fontSize: '24px'
            }}>
              <CheckCircleOutlined />
            </div>
          </div>
        </Card>
      </Col>
      
      <Col xs={12} sm={6}>
        <Card
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
            height: '100%',
            border: 'none',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #faad1411 0%, #faad1422 100%)',
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ marginBottom: 8, fontSize: 14, color: 'rgba(0, 0, 0, 0.45)' }}>即将到期</div>
              <div style={{ fontSize: 30, fontWeight: 'bold', color: '#faad14', lineHeight: 1 }}>{taskStats.upcoming}</div>
            </div>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '25px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#faad14',
              color: '#fff',
              fontSize: '24px'
            }}>
              <CalendarOutlined />
            </div>
          </div>
        </Card>
      </Col>
      
      <Col xs={12} sm={6}>
        <Card
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
            height: '100%',
            border: 'none',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ff4d4f11 0%, #ff4d4f22 100%)',
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ marginBottom: 8, fontSize: 14, color: 'rgba(0, 0, 0, 0.45)' }}>已逾期</div>
              <div style={{ fontSize: 30, fontWeight: 'bold', color: '#ff4d4f', lineHeight: 1 }}>{taskStats.overdue}</div>
            </div>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '25px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#ff4d4f',
              color: '#fff',
              fontSize: '24px'
            }}>
              <ClockCircleOutlined />
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

// 任务分析组件
const TaskAnalytics = ({ taskData }: { taskData: API.Task[] }) => {
  const [visible, setVisible] = useState(false);
  
  // 按优先级统计数据
  const priorityData = [
    { type: '高优先级', value: taskData.filter(t => t.priority === 'high').length },
    { type: '中优先级', value: taskData.filter(t => t.priority === 'medium').length },
    { type: '低优先级', value: taskData.filter(t => t.priority === 'low').length },
  ];
  
  // 按分类统计数据
  const categoryData = [
    { type: '工作', value: taskData.filter(t => t.category === 'work').length },
    { type: '学习', value: taskData.filter(t => t.category === 'study').length },
    { type: '生活', value: taskData.filter(t => t.category === 'life').length },
    { type: '其他', value: taskData.filter(t => t.category === 'other').length },
  ];
  
  // 按完成情况统计
  const statusData = [
    { type: '已完成', value: taskData.filter(t => t.completed).length },
    { type: '未完成', value: taskData.filter(t => !t.completed).length },
  ];
  
  return (
    <>
      <Button 
        type="primary" 
        icon={<BarChartOutlined />}
        onClick={() => setVisible(true)}
        style={{ marginRight: 8 }}
      >
        数据分析
      </Button>
      
      <Modal
        title="任务数据分析"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={4}>任务概览</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Card>
                  <Statistic 
                    title="总任务数" 
                    value={taskData.length} 
                    prefix={<FireOutlined />} 
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic 
                    title="完成率" 
                    value={taskData.length > 0 ? 
                      (taskData.filter(t => t.completed).length / taskData.length * 100).toFixed(1) : 0
                    } 
                    suffix="%" 
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic 
                    title="高优先级任务" 
                    value={taskData.filter(t => t.priority === 'high').length} 
                    prefix={<ThunderboltOutlined />}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
          
          <Col span={12}>
            <Card title="任务优先级分布">
              <SimpleCharts.Pie data={priorityData} />
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="任务分类统计">
              <SimpleCharts.Column data={categoryData} />
            </Card>
          </Col>
          
          <Col span={24}>
            <Card title="任务完成情况">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <Progress
                  type="circle"
                  percent={taskData.length > 0 ? Math.round(statusData[0].value / taskData.length * 100) : 0}
                  format={percent => `${percent}%完成率`}
                  width={120}
                />
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic 
                    title="已完成任务" 
                    value={statusData[0].value} 
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="待完成任务" 
                    value={statusData[1].value} 
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

const TaskList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<API.Task | undefined>(undefined);
  const { initialState } = useModel('@@initialState');
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'calendar'>('table');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [taskData, setTaskData] = useState<API.Task[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    upcoming: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [calendarMode, setCalendarMode] = useState<'month' | 'year'>('month');
  const [helpModalVisible, setHelpModalVisible] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  
  // 获取当前用户信息
  const currentToken = initialState?.currentToken;
  const currentUserId = currentToken?.userId;
  const isAdmin = currentToken?.userCode === 'root' || 
                 (currentToken?.privSet && currentToken?.privSet.includes('admin'));
  
  useEffect(() => {
    console.log('当前用户信息:', currentToken);
    
    if (!currentUserId) {
      message.warning('请先登录获取您的个人任务');
    } else {
      // 已登录，手动触发加载
      console.log('已登录用户ID:', currentUserId);
      actionRef.current?.reload();
    }
  }, [currentUserId]);

  // 计算任务统计信息
  useEffect(() => {
    if (taskData.length > 0) {
      const today = moment().format('YYYY-MM-DD');
      const completed = taskData.filter(task => task.completed).length;
      const upcoming = taskData.filter(task => !task.completed && task.dueDate && task.dueDate > today).length;
      const overdue = taskData.filter(task => !task.completed && task.dueDate && task.dueDate < today).length;
      
      setTaskStats({
        total: taskData.length,
        completed: completed,
        upcoming: upcoming,
        overdue: overdue,
      });
    }
  }, [taskData]);
  
  // 当过滤条件变化时重新加载数据
  useEffect(() => {
    if (actionRef.current && currentUserId) {
      console.log('过滤条件变化，重新加载数据:', { activeTab, filterPriority, filterCategory, searchText });
      actionRef.current.reload();
    }
  }, [activeTab, filterPriority, filterCategory, searchText]);
  
  // 任务颜色映射
  const priorityColors = {
    high: 'red',
    medium: 'orange',
    low: 'green',
  };
  
  // 任务分类映射
  const categoryText = {
    work: '工作',
    study: '学习',
    life: '生活',
    other: '其他',
  };
  
  // 过滤和搜索任务
  const getFilteredTasks = () => {
    let filtered = [...taskData];
    
    // 按选项卡过滤
    if (activeTab !== 'all') {
      const today = moment().format('YYYY-MM-DD');
      
      if (activeTab === 'completed') {
        filtered = filtered.filter(task => task.completed);
      } else if (activeTab === 'uncompleted') {
        filtered = filtered.filter(task => !task.completed);
      } else if (activeTab === 'upcoming') {
        filtered = filtered.filter(task => !task.completed && task.dueDate && task.dueDate > today);
      } else if (activeTab === 'overdue') {
        filtered = filtered.filter(task => !task.completed && task.dueDate && task.dueDate < today);
      }
    }
    
    // 按搜索文本过滤
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(task => 
        (task.title && task.title.toLowerCase().includes(lowerSearch)) ||
        (task.description && task.description.toLowerCase().includes(lowerSearch))
      );
    }
    
    // 按优先级过滤
    if (filterPriority) {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }
    
    // 按分类过滤
    if (filterCategory) {
      filtered = filtered.filter(task => task.category === filterCategory);
    }
    
    return filtered;
  };
  
  // 删除单个任务
  const handleDelete = async (id: number) => {
    if (!id || isNaN(Number(id))) {
      message.error('无效的任务ID');
      return;
    }
    
    console.log('准备删除任务ID:', id);
    setTableLoading(true);
    
    try {
      // 调用删除API
      const result = await deleteTask({ id });
      message.success('任务删除成功');
      // 刷新任务列表
      actionRef.current?.reload();
    } catch (error: any) {
      console.error('删除任务错误:', error);
      message.error(`删除任务失败: ${error.message || '未知错误'}`);
    } finally {
      setTableLoading(false);
    }
  };

  // 切换任务完成状态
  const toggleTaskStatus = async (task: API.Task) => {
    if (!task.id || isNaN(Number(task.id))) {
      message.error('无效的任务ID');
      return;
    }
    
    console.log('准备更新任务状态:', task);
    setTableLoading(true);
    
    try {
      // 创建更新对象
      const updatedTask = {
        id: Number(task.id),
        userId: Number(task.userId || 0),
        title: task.title || '',
        description: task.description || '',
        completed: task.completed === true ? false : true, // 取反完成状态，确保是布尔值
        dueDate: task.dueDate || undefined, // 使用undefined而不是null
        priority: task.priority || 'medium',
        category: task.category || 'work'
      };
      
      console.log('更新任务数据:', updatedTask);
      
      // 调用更新API
      const result = await updateTask({ id: Number(task.id) }, updatedTask);
      message.success(updatedTask.completed ? '任务已完成' : '任务已恢复为未完成');
      // 刷新任务列表
      actionRef.current?.reload();
    } catch (error: any) {
      console.error('更新任务状态错误:', error);
      message.error(`更新任务状态失败: ${error.message || '未知错误'}`);
    } finally {
      setTableLoading(false);
    }
  };

  // 批量完成任务
  const handleBatchComplete = async () => {
    if (!selectedRowKeys || selectedRowKeys.length === 0) {
      message.warning('请至少选择一个任务');
      return;
    }
    
    console.log('批量完成任务，选中的ID:', selectedRowKeys);
    setBatchLoading(true);
    
    try {
      // 找出选中的任务
      const selectedTasks = taskData.filter(task => selectedRowKeys.includes(task.id || 0));
      
      // 批量更新任务状态
      const promises = selectedTasks.map(task => {
        // 创建更新对象
        const updatedTask = {
          id: Number(task.id || 0),
          userId: Number(task.userId || 0),
          title: task.title || '',
          description: task.description || '',
          completed: true, // 设置为完成
          dueDate: task.dueDate || undefined,
          priority: task.priority || 'medium',
          category: task.category || 'work'
        };
        
        // 调用更新API
        return updateTask({ id: Number(task.id) }, updatedTask);
      });
      
      // 等待所有更新完成
      const results = await Promise.allSettled(promises);
      
      // 统计成功和失败的数量
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (succeeded > 0) {
        message.success(`成功完成 ${succeeded} 个任务`);
        // 清空选择
        setSelectedRowKeys([]);
        // 刷新数据
        actionRef.current?.reload();
      }
      
      if (failed > 0) {
        message.warning(`${failed} 个任务更新失败`);
      }
    } catch (error: any) {
      console.error('批量完成任务错误:', error);
      message.error(`批量操作失败: ${error.message || '未知错误'}`);
    } finally {
      setBatchLoading(false);
    }
  };

  // 批量删除任务
  const handleBatchDelete = async () => {
    if (!selectedRowKeys || selectedRowKeys.length === 0) {
      message.warning('请至少选择一个任务');
      return;
    }
    
    console.log('批量删除任务，选中的ID:', selectedRowKeys);
    setBatchLoading(true);
    
    try {
      // 批量删除任务
      const promises = selectedRowKeys.map(id => {
        if (typeof id === 'number' || !isNaN(Number(id))) {
          return deleteTask({ id: Number(id) });
        }
        return Promise.reject(new Error(`无效的任务ID: ${id}`));
      });
      
      // 等待所有删除完成
      const results = await Promise.allSettled(promises);
      
      // 统计成功和失败的数量
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (succeeded > 0) {
        message.success(`成功删除 ${succeeded} 个任务`);
        // 清空选择
        setSelectedRowKeys([]);
        // 刷新数据
        actionRef.current?.reload();
      }
      
      if (failed > 0) {
        message.warning(`${failed} 个任务删除失败`);
      }
    } catch (error: any) {
      console.error('批量删除任务错误:', error);
      message.error(`批量操作失败: ${error.message || '未知错误'}`);
    } finally {
      setBatchLoading(false);
    }
  };

  // 渲染任务日历
  const renderCalendarTasks = (date: Dayjs | Moment) => {
    // 统一使用moment格式化日期
    const dateStr = moment(date.toString()).format('YYYY-MM-DD');
    // 先获取当天的所有任务，然后应用筛选条件
    const allDayTasks = taskData.filter(task => task.dueDate === dateStr);
    
    // 应用筛选条件 - 与getFilteredTasks保持一致
    let filteredDayTasks = [...allDayTasks];
    
    // 按选项卡过滤
    if (activeTab !== 'all') {
      const today = moment().format('YYYY-MM-DD');
      
      if (activeTab === 'completed') {
        filteredDayTasks = filteredDayTasks.filter(task => task.completed);
      } else if (activeTab === 'uncompleted') {
        filteredDayTasks = filteredDayTasks.filter(task => !task.completed);
      } else if (activeTab === 'upcoming') {
        filteredDayTasks = filteredDayTasks.filter(task => !task.completed && task.dueDate && task.dueDate > today);
      } else if (activeTab === 'overdue') {
        filteredDayTasks = filteredDayTasks.filter(task => !task.completed && task.dueDate && task.dueDate < today);
      }
    }
    
    // 按搜索文本过滤
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filteredDayTasks = filteredDayTasks.filter(task => 
        (task.title && task.title.toLowerCase().includes(lowerSearch)) ||
        (task.description && task.description.toLowerCase().includes(lowerSearch))
      );
    }
    
    // 按优先级过滤
    if (filterPriority) {
      filteredDayTasks = filteredDayTasks.filter(task => task.priority === filterPriority);
    }
    
    // 按分类过滤
    if (filterCategory) {
      filteredDayTasks = filteredDayTasks.filter(task => task.category === filterCategory);
    }
    
    if (filteredDayTasks.length === 0) {
      return null;
    }
    
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {filteredDayTasks.slice(0, 2).map(task => (
          <li key={task.id}>
            <Tag
              color={task.completed ? 'green' : task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'green'}
              style={{ margin: '2px 0', width: '100%', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              onClick={() => {
                setCurrentTask(task);
                setFormVisible(true);
              }}
            >
              {task.completed ? <CheckCircleOutlined /> : null} {task.title}
            </Tag>
          </li>
        ))}
        {filteredDayTasks.length > 2 && (
          <li>
            <Button 
              type="link" 
              size="small" 
              onClick={() => {
                Modal.info({
                  title: `${dateStr} 的所有任务`,
                  content: (
                    <List
                      size="small"
                      dataSource={filteredDayTasks}
                      renderItem={task => (
                        <List.Item 
                          actions={[
                            <a onClick={() => {
                              Modal.destroyAll();
                              setCurrentTask(task);
                              setFormVisible(true);
                            }}>编辑</a>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                style={{ 
                                  backgroundColor: task.completed ? 'green' : 
                                                  task.priority === 'high' ? 'red' : 
                                                  task.priority === 'medium' ? 'orange' : 'green' 
                                }} 
                                icon={task.completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />} 
                              />
                            }
                            title={task.title}
                            description={`${categoryText[task.category as keyof typeof categoryText]} · ${task.completed ? '已完成' : '未完成'}`}
                          />
                        </List.Item>
                      )}
                    />
                  ),
                  width: 600,
                });
              }}
            >
              还有 {filteredDayTasks.length - 2} 项任务...
            </Button>
          </li>
        )}
      </ul>
    );
  };
  
  const columns: ProColumns<API.Task>[] = [
    {
      title: '标题',
      dataIndex: 'title',
      render: (_, record) => (
        <Space>
          {record.priority && (
            <Badge color={priorityColors[record.priority as keyof typeof priorityColors]} />
          )}
          <a onClick={() => {
            setCurrentTask(record);
            setFormVisible(true);
          }}>
            {record.completed ? <s>{record.title}</s> : record.title}
          </a>
          {record.completed && (
            <Tag color="green" icon={<CheckCircleOutlined />}>已完成</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      render: (_, record) => (
        record.category && (
          <Tag color="blue">
            {categoryText[record.category as keyof typeof categoryText]}
          </Tag>
        )
      ),
      hideInSearch: true,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      render: (_, record) => {
        const priority = record.priority as keyof typeof priorityColors;
        return priority ? (
          <Tag color={priorityColors[priority]}>
            {priority === 'high' ? '高' : 
             priority === 'medium' ? '中' : '低'}
          </Tag>
        ) : null;
      },
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'completed',
      render: (_, record) => (
        <a onClick={() => toggleTaskStatus(record)}>
          {record.completed ? 
            <Badge status="success" text="已完成" /> : 
            <Badge status="default" text="未完成" />}
        </a>
      ),
      hideInSearch: true,
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      valueType: 'date',
      render: (_, record) => {
        if (!record.dueDate) return '-';
        
        const dueDate = moment(record.dueDate);
        const today = moment();
        const isOverdue = !record.completed && dueDate.isBefore(today, 'day');
        
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
            {isOverdue ? <ClockCircleOutlined style={{ marginRight: 4 }} /> : null}
            {dueDate.format('YYYY-MM-DD')}
          </span>
        );
      },
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <Tooltip title="编辑" key="edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentTask(record);
              setFormVisible(true);
            }}
          />
        </Tooltip>,
        <Tooltip title="完成/取消完成" key="toggle">
          <Button
            type="text"
            icon={record.completed ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
            onClick={() => toggleTaskStatus(record)}
          />
        </Tooltip>,
        <Tooltip title="删除" key="delete">
          <Popconfirm
            title="确定删除此任务吗?"
            onConfirm={() => handleDelete(record.id!)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Tooltip>,
      ],
    },
  ];

  // 卡片视图拖拽处理
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setTaskData((items) => {
        const oldIndex = items.findIndex(item => String(item.id) === String(active.id));
        const newIndex = items.findIndex(item => String(item.id) === String(over?.id));
        
        return arrayMove(items, oldIndex, newIndex);
      });

      message.success('任务顺序已更新');
    }
  };

  // 加载数据的处理函数
  const handleDataLoaded = (data: API.Task[]) => {
    setTaskData(data);
  };
  
  // 帮助信息组件
  const HelpModal = () => (
    <Modal
      title="任务管理使用帮助"
      open={helpModalVisible}
      onCancel={() => setHelpModalVisible(false)}
      footer={[
        <Button key="close" type="primary" onClick={() => setHelpModalVisible(false)}>
          知道了
        </Button>
      ]}
      width={600}
    >
      <Typography>
        <Title level={4}>欢迎使用任务管理系统</Title>
        <Paragraph>
          这是一个功能丰富的任务管理工具，可以帮助您更高效地组织和跟踪您的工作、学习和生活任务。
        </Paragraph>
        
        <Title level={4}>基本功能</Title>
        <Paragraph>
          <ul>
            <li><strong>创建任务</strong>：点击右上角的"新建任务"按钮</li>
            <li><strong>编辑任务</strong>：点击任务标题或操作栏中的编辑图标</li>
            <li><strong>完成任务</strong>：点击任务状态或操作栏中的完成图标</li>
            <li><strong>删除任务</strong>：点击操作栏中的删除图标</li>
          </ul>
        </Paragraph>
        
        <Title level={4}>视图模式</Title>
        <Paragraph>
          <ul>
            <li><strong>表格视图</strong>：以表格形式展示任务，便于查看详细信息</li>
            <li><strong>卡片视图</strong>：以卡片形式展示任务，直观且可拖拽排序</li>
            <li><strong>日历视图</strong>：按日期查看任务，帮助规划日程</li>
          </ul>
        </Paragraph>
        
        <Title level={4}>高级功能</Title>
        <Paragraph>
          <ul>
            <li><strong>批量操作</strong>：选择多个任务进行批量完成或批量删除</li>
            <li><strong>筛选和分类</strong>：使用标签页、搜索框和筛选按钮精确查找任务</li>
            <li><strong>数据分析</strong>：使用图表和统计功能分析您的任务分布和完成情况</li>
            <li><strong>拖拽排序</strong>：在卡片视图中拖拽任务卡片调整任务顺序</li>
          </ul>
        </Paragraph>
      </Typography>
    </Modal>
  );
  
  // 从URL参数中获取action
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    
    if (action === 'create') {
      // 自动打开创建任务表单
      setCurrentTask(undefined); // 确保是创建新任务而不是编辑
      setFormVisible(true);
      // 清除URL参数，避免刷新页面时重复触发
      history.push('/task');
    }
  }, []);
  
  return (
    <PageContainer
      extra={[
        <Button 
          icon={<InfoCircleOutlined />}
          onClick={() => setHelpModalVisible(true)}
          key="help"
          style={{ marginRight: 8 }}
        >
          使用帮助
        </Button>,
        <TaskAnalytics taskData={taskData} key="analytics" />,
        <Dropdown menu={{
          items: [
            {
              key: 'table',
              icon: <UnorderedListOutlined />,
              label: '表格视图',
              onClick: () => setViewMode('table')
            },
            {
              key: 'card',
              icon: <AppstoreOutlined />,
              label: '卡片视图',
              onClick: () => setViewMode('card')
            },
            {
              key: 'calendar',
              icon: <CalendarOutlined />,
              label: '日历视图',
              onClick: () => setViewMode('calendar')
            }
          ]
        }} key="viewToggle">
          <Button>
            {viewMode === 'table' ? <UnorderedListOutlined /> : 
             viewMode === 'card' ? <AppstoreOutlined /> : 
             <CalendarOutlined />}
            {viewMode === 'table' ? ' 表格视图' : 
             viewMode === 'card' ? ' 卡片视图' : 
             ' 日历视图'}
            <SettingOutlined style={{ marginLeft: 8 }} />
          </Button>
        </Dropdown>,
        <Button
          type="primary"
          key="create"
          icon={<PlusOutlined />}
          onClick={() => {
            setCurrentTask(undefined);
            setFormVisible(true);
          }}
        >
          新建任务
        </Button>,
      ]}
    >
      <HelpModal />
      <StatisticsCards taskStats={taskStats} />
      
      <Card style={{ 
        margin: '0 0 16px 0',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.09)'
      }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12} lg={14} xl={16}>
            <Search
              placeholder="搜索任务标题或描述"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onSearch={value => setSearchText(value)}
              style={{ width: '100%' }}
              allowClear
              enterButton
              prefix={<SearchOutlined />}
              size="middle"
            />
          </Col>
          <Col xs={12} md={6} lg={5} xl={4}>
            <Dropdown menu={{
              selectedKeys: filterPriority ? [filterPriority] : [],
              onClick: ({ key }) => setFilterPriority(key === 'all' ? null : key),
              items: [
                { key: 'all', label: <span><FilterOutlined /> 全部优先级</span> },
                { key: 'high', label: <span><Badge color="red" /> 高优先级</span> },
                { key: 'medium', label: <span><Badge color="orange" /> 中优先级</span> },
                { key: 'low', label: <span><Badge color="green" /> 低优先级</span> }
              ]
            }}>
              <Button 
                icon={<FilterOutlined />} 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {filterPriority ? 
                    (filterPriority === 'high' ? '高优先级' : 
                     filterPriority === 'medium' ? '中优先级' : '低优先级') : 
                    '优先级'}
                </span>
              </Button>
            </Dropdown>
          </Col>
          <Col xs={12} md={6} lg={5} xl={4}>
            <Dropdown menu={{
              selectedKeys: filterCategory ? [filterCategory] : [],
              onClick: ({ key }) => setFilterCategory(key === 'all' ? null : key),
              items: [
                { key: 'all', label: <span><FilterOutlined /> 全部分类</span> },
                { key: 'work', label: <span><PushpinOutlined /> 工作</span> },
                { key: 'study', label: <span><ClockCircleOutlined /> 学习</span> },
                { key: 'life', label: <span><TagOutlined /> 生活</span> },
                { key: 'other', label: <span><FlagOutlined /> 其他</span> }
              ]
            }}>
              <Button 
                icon={<FilterOutlined />}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {filterCategory ? categoryText[filterCategory as keyof typeof categoryText] : '分类'}
                </span>
              </Button>
            </Dropdown>
          </Col>
        </Row>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          size="large"
          type="card"
          items={[
            { key: 'all', label: <span><Badge status="processing" /> 全部</span> },
            { key: 'completed', label: <span><Badge status="success" /> 已完成</span> },
            { key: 'uncompleted', label: <span><Badge status="default" /> 未完成</span> },
            { key: 'upcoming', label: <span><Badge status="processing" /> 即将到期</span> },
            { key: 'overdue', label: <span><Badge status="error" /> 已逾期</span> }
          ]} 
        />
      </Card>
      
      {viewMode === 'table' ? (
        <ProTable<API.Task>
          headerTitle={false}
          actionRef={actionRef}
          rowKey="id"
          search={false}
          options={false}
          cardProps={{
            bodyStyle: { padding: 0 },
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            selections: [
              {
                key: 'all',
                text: '全选所有',
                onSelect: () => setSelectedRowKeys(taskData.map(task => task.id!)),
              },
              {
                key: 'completed',
                text: '选择已完成',
                onSelect: () => {
                  const completedKeys = taskData
                    .filter(task => task.completed)
                    .map(task => task.id as number)
                    .filter(id => id !== undefined);
                  setSelectedRowKeys(completedKeys);
                },
              },
              {
                key: 'uncompleted',
                text: '选择未完成',
                onSelect: () => {
                  const uncompletedKeys = taskData
                    .filter(task => !task.completed)
                    .map(task => task.id as number)
                    .filter(id => id !== undefined);
                  setSelectedRowKeys(uncompletedKeys);
                },
              },
              {
                key: 'invert',
                text: '反选',
                onSelect: () => {
                  const allIds = taskData.map(task => task.id!);
                  const invertIds = allIds.filter(id => !selectedRowKeys.includes(id));
                  setSelectedRowKeys(invertIds);
                },
              },
              {
                key: 'clear',
                text: '清空选择',
                onSelect: () => setSelectedRowKeys([]),
              },
            ],
          }}
          tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
            <Space size={24}>
              <span>
                已选 {selectedRowKeys.length} 项
                <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                  取消选择
                </a>
              </span>
            </Space>
          )}
          tableAlertOptionRender={() => (
            <Space size={16}>
              <Button 
                type="primary" 
                onClick={handleBatchComplete}
                loading={batchLoading}
                icon={<CheckCircleOutlined />}
              >
                批量完成
              </Button>
              <Popconfirm
                title="确定要删除选中的任务吗？"
                onConfirm={handleBatchDelete}
                okText="确定"
                cancelText="取消"
              >
                <Button danger loading={batchLoading} icon={<DeleteOutlined />}>批量删除</Button>
              </Popconfirm>
            </Space>
          )}
          pagination={{
            showQuickJumper: true,
            pageSize: 10,
          }}
          request={async (params) => {
            const { current, pageSize, ...rest } = params;
            // 如果当前用户ID为空，提前返回空数据，避免无效请求
            if (!currentUserId) {
              console.log('当前用户ID为空，跳过请求');
              return { data: [], total: 0, success: false };
            }
            
            const pageParams = {
              pageNum: current || 1,
              pageSize: pageSize || 10,
              // 只有管理员才可以传递指定的userId参数，否则使用当前用户ID
              userId: isAdmin ? (rest.userId || currentUserId) : currentUserId,
              ...rest
            };
            
            console.log('任务查询参数:', pageParams);
            
            try {
              setLoading(true);
              const result = await listTasksByPage(pageParams);
              
              console.log('查询结果:', result);
              
              // 处理数据加载
              if (result && result.list) {
                console.log('加载任务列表:', result.list.length, '条数据');
                let filteredList = [...result.list];
                
                // 根据选项卡过滤
                if (activeTab !== 'all') {
                  const today = moment().format('YYYY-MM-DD');
                  
                  if (activeTab === 'completed') {
                    filteredList = filteredList.filter(task => task.completed);
                  } else if (activeTab === 'uncompleted') {
                    filteredList = filteredList.filter(task => !task.completed);
                  } else if (activeTab === 'upcoming') {
                    filteredList = filteredList.filter(task => !task.completed && task.dueDate && task.dueDate > today);
                  } else if (activeTab === 'overdue') {
                    filteredList = filteredList.filter(task => !task.completed && task.dueDate && task.dueDate < today);
                  }
                }
                
                // 根据优先级过滤
                if (filterPriority) {
                  filteredList = filteredList.filter(task => task.priority === filterPriority);
                }
                
                // 根据分类过滤
                if (filterCategory) {
                  filteredList = filteredList.filter(task => task.category === filterCategory);
                }
                
                // 更新过滤后的数据
                handleDataLoaded(filteredList);
                
                // 返回过滤后的数据给ProTable
                return {
                  data: filteredList,
                  success: true,
                  total: filteredList.length
                };
              } else {
                console.warn('查询结果中没有list字段');
                return {
                  data: [],
                  total: 0,
                  success: false,
                };
              }
            } catch (error: any) {
              console.error('查询任务失败:', error);
              if (error.response?.status === 403) {
                message.error('您没有权限访问这些任务');
              } else {
                message.error(`查询任务失败: ${error.message || '未知错误'}`);
              }
              return {
                data: [],
                total: 0,
                success: false,
              };
            } finally {
              setLoading(false);
            }
          }}
          columns={columns}
        />
      ) : viewMode === 'card' ? (
        <Card>
          {getFilteredTasks().length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={getFilteredTasks().filter(task => task.id !== undefined).map(task => String(task.id))} strategy={verticalListSortingStrategy}>
                <Row gutter={[16, 16]}>
                  {getFilteredTasks().map(task => (
                    <Col xs={24} sm={12} md={8} lg={6} key={task.id}>
                      <SortableTaskCard 
                        task={task}
                        onEdit={(task) => {
                          setCurrentTask(task);
                          setFormVisible(true);
                        }}
                        onToggle={toggleTaskStatus}
                        onDelete={handleDelete}
                      />
                    </Col>
                  ))}
                </Row>
              </SortableContext>
            </DndContext>
          ) : (
            <Empty 
              description={
                <span>
                  没有找到匹配的任务
                  <Button 
                    type="link" 
                    onClick={() => {
                      setCurrentTask(undefined);
                      setFormVisible(true);
                    }}
                  >
                    创建一个新任务
                  </Button>
                </span>
              } 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
            />
          )}
        </Card>
      ) : (
        <Card
          title={
            <Space>
              <span>任务日历</span>
              <Radio.Group
                value={calendarMode}
                onChange={e => setCalendarMode(e.target.value)}
                buttonStyle="solid"
                size="small"
              >
                <Radio.Button value="month">月视图</Radio.Button>
                <Radio.Button value="year">年视图</Radio.Button>
              </Radio.Group>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Spin spinning={loading}>
            <Calendar 
              mode={calendarMode}
              dateCellRender={renderCalendarTasks}
              onPanelChange={(date, mode) => {
                console.log('日历面板变化:', date.format('YYYY-MM-DD'), mode);
              }}
              fullscreen={false}
              style={{ 
                background: '#fff',
                padding: '12px',
                borderRadius: '8px'
              }}
            />
          </Spin>
        </Card>
      )}

      {viewMode !== 'table' && selectedRowKeys.length > 0 && (
        <Card 
          style={{
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            zIndex: 1000,
            boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
          }}
        >
          <Space>
            <span>已选 {selectedRowKeys.length} 项</span>
            <Button 
              type="primary" 
              size="small" 
              onClick={handleBatchComplete}
              loading={batchLoading}
              icon={<CheckCircleOutlined />}
            >
              批量完成
            </Button>
            <Popconfirm
              title="确定要删除选中的任务吗？"
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                danger 
                size="small" 
                loading={batchLoading} 
                icon={<DeleteOutlined />}
              >
                批量删除
              </Button>
            </Popconfirm>
            <Button 
              size="small" 
              onClick={() => setSelectedRowKeys([])}
            >
              取消选择
            </Button>
          </Space>
        </Card>
      )}
      
      <TaskForm
        visible={formVisible}
        task={currentTask}
        onCancel={() => setFormVisible(false)}
        onSuccess={() => {
          setFormVisible(false);
          actionRef.current?.reload();
        }}
      />
    </PageContainer>
  );
};

export default TaskList; 