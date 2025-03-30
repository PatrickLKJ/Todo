import React, { useEffect, useState } from 'react';
import { Form, Input, Modal, DatePicker, Switch, message, Select, Tag, Space, Row, Col, Divider, Button, Alert } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, FlagOutlined, TagOutlined, PushpinOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { createTask, updateTask } from '@/services/api/task';
import { useModel } from 'umi';

interface TaskFormProps {
  visible: boolean;
  task?: API.Task;
  onCancel: () => void;
  onSuccess: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ visible, task, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const currentUserId = initialState?.currentToken?.userId;
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // 优先级映射到样式
  const priorityColors = {
    high: '#f5222d',
    medium: '#faad14',
    low: '#52c41a',
  };
  
  // 分类映射到图标
  const categoryIcons = {
    work: <PushpinOutlined />,
    study: <ClockCircleOutlined />,
    life: <TagOutlined />,
    other: <FlagOutlined />,
  };
  
  useEffect(() => {
    if (visible) {
      // 重置错误信息
      setErrorMessage(null);
      
      if (task) {
        // 编辑模式 - 设置表单值
        const formValues = {
          ...task,
          dueDate: task.dueDate ? moment(task.dueDate) : undefined,
        };
        console.log('编辑模式表单初始值:', formValues);
        form.setFieldsValue(formValues);
      } else {
        // 新建模式 - 重置表单并设置默认值
        form.resetFields();
        const defaultValues = {
          userId: currentUserId,
          completed: false,
          priority: 'medium',
          category: 'work',
        };
        console.log('新建模式表单默认值:', defaultValues);
        form.setFieldsValue(defaultValues);
      }
    }
  }, [visible, task, form, initialState, currentUserId]);
  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const values = await form.validateFields();
      
      // 创建任务数据对象，确保数据类型和字段正确
      const taskData = {
        userId: Number(currentUserId),
        title: values.title.trim(),
        description: values.description ? values.description.trim() : '',
        completed: values.completed === true ? true : false, // 确保是布尔值
        dueDate: values.dueDate ? moment(values.dueDate).format('YYYY-MM-DD') : undefined,
        priority: values.priority || 'medium',
        category: values.category || 'work'
      };
      
      console.log('提交任务数据:', taskData);
      
      try {
        if (task?.id) {
          // 更新任务
          await updateTask({ id: Number(task.id) }, { ...taskData, id: task.id });
          message.success('任务更新成功');
        } else {
          // 创建任务
          await createTask(taskData);
          message.success('任务创建成功');
        }
        onSuccess();
      } catch (error: any) {
        console.error('API请求错误:', error);
        setErrorMessage(error.message || '服务器错误，请稍后重试');
        message.error('操作失败: ' + (error.message || '未知错误'));
      }
    } catch (error) {
      console.error('表单验证错误:', error);
      message.error('请填写所有必填项');
    } finally {
      setLoading(false);
    }
  };
  
  // 预览当前任务
  const TaskPreview = () => {
    const values = form.getFieldsValue();
    const priority = values.priority as 'high' | 'medium' | 'low' || 'medium';
    const category = values.category as 'work' | 'study' | 'life' | 'other' || 'work';
    
    return (
      <div style={{ padding: '8px 0' }}>
        <Divider orientation="left">任务预览</Divider>
        <Row>
          <Col span={24}>
            <h3>{values.title || '(未填写标题)'}</h3>
            <p style={{ color: '#666' }}>{values.description || '(无描述)'}</p>
            <Space>
              {values.dueDate && (
                <Tag icon={<CalendarOutlined />} color="#108ee9">
                  截止: {typeof values.dueDate === 'object' && moment.isMoment(values.dueDate) 
                    ? values.dueDate.format('YYYY-MM-DD') 
                    : typeof values.dueDate === 'string' 
                      ? values.dueDate
                      : '无效日期'}
                </Tag>
              )}
              <Tag icon={categoryIcons[category]} color="#87d068">
                {category === 'work' ? '工作' : 
                 category === 'study' ? '学习' : 
                 category === 'life' ? '生活' : '其他'}
              </Tag>
              <Tag color={priorityColors[priority]}>
                {priority === 'high' ? '高优先级' : 
                 priority === 'medium' ? '中优先级' : '低优先级'}
              </Tag>
              {values.completed && <Tag color="green">已完成</Tag>}
            </Space>
          </Col>
        </Row>
      </div>
    );
  };
  
  return (
    <Modal
      title={task?.id ? '编辑任务' : '创建新任务'}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={handleSubmit}
        >
          {task?.id ? '保存更改' : '创建任务'}
        </Button>,
      ]}
      destroyOnClose
      width={520}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto', padding: '24px' }}
    >
      {errorMessage && (
        <Alert
          message="提交错误"
          description={errorMessage}
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{ marginBottom: 16 }}
          closable
        />
      )}
      
      <Form form={form} layout="vertical">
        {/* 隐藏用户ID字段，通过代码逻辑自动获取 */}
        <Form.Item name="userId" hidden>
          <Input type="hidden" />
        </Form.Item>
        
        <Form.Item
          name="title"
          label="任务标题"
          rules={[{ required: true, message: '请输入任务标题' }]}
        >
          <Input placeholder="输入任务标题" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="任务描述"
        >
          <Input.TextArea rows={4} placeholder="输入任务详细描述..." />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="priority"
              label="优先级"
              rules={[{ required: true, message: '请选择优先级' }]}
            >
              <Select placeholder="请选择优先级">
                <Select.Option value="high">
                  <Tag color={priorityColors.high}>高优先级</Tag>
                </Select.Option>
                <Select.Option value="medium">
                  <Tag color={priorityColors.medium}>中优先级</Tag>
                </Select.Option>
                <Select.Option value="low">
                  <Tag color={priorityColors.low}>低优先级</Tag>
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="请选择分类">
                <Select.Option value="work">
                  <Space>{categoryIcons.work} 工作</Space>
                </Select.Option>
                <Select.Option value="study">
                  <Space>{categoryIcons.study} 学习</Space>
                </Select.Option>
                <Select.Option value="life">
                  <Space>{categoryIcons.life} 生活</Space>
                </Select.Option>
                <Select.Option value="other">
                  <Space>{categoryIcons.other} 其他</Space>
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dueDate"
              label="截止日期"
            >
              <DatePicker style={{ width: '100%' }} placeholder="选择截止日期" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="completed"
              label="完成状态"
              valuePropName="checked"
            >
              <Switch checkedChildren="已完成" unCheckedChildren="未完成" />
            </Form.Item>
          </Col>
        </Row>
        
        <TaskPreview />
      </Form>
    </Modal>
  );
};

export default TaskForm;