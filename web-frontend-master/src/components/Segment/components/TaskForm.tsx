import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, DatePicker, Switch, message, Select, Button, Row, Col, Typography } from 'antd';
import { createTask, updateTask } from '@/services/api/task';
import { useModel, history } from 'umi';
import moment from 'moment';
import { PrioritySelect } from './PrioritySelect';

const { TextArea } = Input;
const { Option } = Select;
const { Paragraph } = Typography;

export interface TaskFormProps {
  visible: boolean;
  task?: API.Task;
  onCancel: () => void;
  onSuccess: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ visible, task, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [loginChecked, setLoginChecked] = useState(false);

  // 任务类别选项
  const categoryOptions = [
    { label: '工作', value: 'work' },
    { label: '学习', value: 'study' },
    { label: '生活', value: 'life' },
    { label: '其他', value: 'other' }
  ];

  // 检查用户是否已登录
  useEffect(() => {
    if (visible) {
      // 检查登录状态
      if (!initialState?.currentToken?.userId) {
        message.error('您尚未登录或登录已过期，请重新登录');
        setLoginChecked(false);
        // 可以选择在这里重定向到登录页面
        setTimeout(() => {
          onCancel(); // 关闭当前对话框
          history.push('/user/login'); // 重定向到登录页面
        }, 1500);
        return;
      }
      
      setLoginChecked(true);
      form.resetFields();
      
      if (task) {
        // 编辑模式：填充表单数据
        const formData = {
          ...task,
          dueDate: task.dueDate ? moment(task.dueDate) : undefined
        };
        form.setFieldsValue(formData);
      } else {
        // 创建模式：设置默认值
        form.setFieldsValue({
          userId: initialState?.currentToken?.userId,
          completed: false,
          priority: 'medium'
        });
      }
      
      setPreviewMode(false);
    }
  }, [visible, task, form, initialState]);

  const handleSubmit = async () => {
    // 再次检查登录状态
    if (!initialState?.currentToken?.userId) {
      message.error('您尚未登录或登录已过期，请重新登录');
      onCancel();
      history.push('/user/login');
      return;
    }

    try {
      setLoading(true);
      
      // 调试 - 打印当前表单内容
      console.log('提交前表单内容:', form.getFieldsValue());
      
      const values = await form.validateFields();
      console.log('表单验证通过, 提交数据:', values);
      
      // 确保userId存在且为数字类型
      values.userId = initialState?.currentToken?.userId;
      if (!values.userId) {
        throw new Error('无法获取用户ID，请确认您已登录');
      }
      
      // 格式化日期
      if (values.dueDate) {
        console.log('原始日期值:', values.dueDate);
        // 确保日期格式为 yyyy-MM-dd
        values.dueDate = values.dueDate.format('YYYY-MM-DD');
        console.log('格式化后的日期:', values.dueDate);
      }
      
      // 调试 - 打印最终提交的数据
      console.log('最终提交数据:', values);
      
      if (task?.id) {
        // 更新任务
        await updateTask({ id: Number(task.id) }, values);
        message.success('更新任务成功');
      } else {
        // 创建任务
        const result = await createTask(values);
        console.log('创建任务结果:', result);
        message.success('创建任务成功');
      }
      
      onSuccess();
    } catch (error) {
      console.error('提交失败详细错误:', error);
      message.error('提交失败，请检查表单');
    } finally {
      setLoading(false);
    }
  };

  // 任务预览渲染
  const renderTaskPreview = () => {
    const formValues = form.getFieldsValue();
    
    return (
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h2 style={{ marginBottom: '16px' }}>{formValues.title || '任务标题'}</h2>
        
        <div style={{ marginBottom: '8px' }}>
          <strong>状态：</strong>
          {formValues.completed ? '已完成' : '未完成'}
        </div>
        
        {formValues.priority && (
          <div style={{ marginBottom: '8px' }}>
            <strong>优先级：</strong>
            {
              formValues.priority === 'high' ? '高' : 
              formValues.priority === 'medium' ? '中' : '低'
            }
          </div>
        )}
        
        {formValues.category && (
          <div style={{ marginBottom: '8px' }}>
            <strong>分类：</strong>
            {
              categoryOptions.find(opt => opt.value === formValues.category)?.label || formValues.category
            }
          </div>
        )}
        
        {formValues.dueDate && (
          <div style={{ marginBottom: '8px' }}>
            <strong>截止日期：</strong>
            {/* 修复：确保dueDate是moment对象并正确格式化 */}
            {moment.isMoment(formValues.dueDate) ? formValues.dueDate.format('YYYY-MM-DD') : formValues.dueDate}
          </div>
        )}
        
        {formValues.description && (
          <>
            <div style={{ marginTop: '16px' }}><strong>描述：</strong></div>
            <p style={{ whiteSpace: 'pre-wrap' }}>{formValues.description}</p>
          </>
        )}
      </div>
    );
  };
  
  return (
    <Modal
      title={task?.id ? '编辑任务' : '创建任务'}
      open={visible}
      onCancel={onCancel}
      footer={!loginChecked ? [
        <Button key="cancel" onClick={onCancel}>
          关闭
        </Button>
      ] : [
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="preview"
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? '编辑' : '预览'}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          保存
        </Button>
      ]}
      width={720}
      destroyOnClose
    >
      {!loginChecked ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3>检测到您尚未登录或登录已过期</h3>
          <p>正在跳转到登录页面...</p>
        </div>
      ) : previewMode ? (
        renderTaskPreview()
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item name="userId" hidden>
            <Input />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="title"
                label="任务标题"
                rules={[{ required: true, message: '请输入任务标题' }]}
              >
                <Input placeholder="请输入任务标题" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="category"
                label="分类"
              >
                <Select placeholder="选择分类">
                  {categoryOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="dueDate"
                label="截止日期"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="priority"
                label="优先级"
              >
                <PrioritySelect />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="completed"
                label="状态"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="已完成" 
                  unCheckedChildren="未完成" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={6} placeholder="请输入任务描述" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default TaskForm;
