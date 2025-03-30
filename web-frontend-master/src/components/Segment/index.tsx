import React, { useRef, useCallback, useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Tag, Popconfirm, message, Card, Checkbox, List, Radio, Space, Statistic, Switch, Typography } from 'antd';
import { PlusOutlined, CloseOutlined, DeleteOutlined, TableOutlined, AppstoreOutlined } from '@ant-design/icons';
import { getTasksByPage as listTasksByPage, deleteTask, updateTask } from '@/services/api/task';
import { useModel } from 'umi';
import TaskForm from './components/TaskForm';
import { convertPageData } from '@/utils/request';
import styles from './index.less';
import {
  redraw,
  DragInfo,
  modifyPoints,
  ajustRect,
  finalAjustPoints,
  getPointIndex,
} from './function';

const KEY_P = 80;
const KEY_L = 76;
const KEY_DEL = 46;

export interface ImageEditorProps {
  visible: boolean;
  imageUrl: string;
  points: number[][];
  rectsVisible: boolean;
  editable: boolean;
  onChange?: (newPoints: number[][]) => void;
  children: any;
}
export interface ScaleInfo {
  scale: number;
  left: number;
  top: number;
}
export default function Segment(props: ImageEditorProps) {
  const dragInfo = useRef<DragInfo>({
    processNewRect: false,
    shapeIndex: -1,
    pointIndex: 0,
    dragActive: false,
    dragImageActive: false,
  });
  const canvas = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const refPoints = useRef<number[][]>(props.points);
  const [currentRect, setCurrentRect] = useState(-1);
  // 放大倍数
  const [scaleInfo, setScaleInfo] = useState<ScaleInfo>({ scale: 0.5, left: 0, top: 0 });
  useEffect(() => {
    setScaleInfo({ scale: 0.5, left: 0, top: 0 });
    setCurrentRect(-1);
  }, [props.imageUrl]);

  const fireOnChange = useCallback((pts: number[][]) => {
    if (!props.onChange) return;
    finalAjustPoints(pts, image.current?.width!, image.current?.height!);
    props.onChange(pts);
  }, []);

  const clearCanvas = useCallback(() => {
    if (!canvas.current || !image.current) {
      return;
    }

    const ctx = canvas.current.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.fillRect(0, 0, canvas.current.width, canvas.current.height);
    ctx.closePath();
    try {
      ctx.drawImage(
        image.current!,
        scaleInfo.left,
        scaleInfo.top,
        canvas.current.width / scaleInfo.scale,
        canvas.current.height / scaleInfo.scale,
        0,
        0,
        canvas.current.width,
        canvas.current.height,
      );
    } catch (ex) {
      console.error(ex);
    }
  }, [scaleInfo]);

  const initScaleInfo = () => {
    if (!canvas.current || !image.current) {
      return;
    }

    const cavasWidth = canvas.current.width - 40;
    const cavasHeight = canvas.current.height - 40;

    let width = image.current.width;
    let height = image.current.height;
    // 先缩放宽度，让其放在cavas里
    let scale = cavasWidth / width;
    width = cavasWidth;
    height = height * scale;

    if (height > cavasHeight) {
      // 再缩放高度，让高度放在cavas里
      scale = cavasHeight / height;
      height = cavasHeight;
      width *= scale;
    }

    scale = width / image.current.width;

    setScaleInfo({ top: -20 / scale, left: -20 / scale, scale });
  };

  const resizeCanvas = useCallback(() => {
    if (!canvas.current || !image.current || !container.current) {
      return;
    }

    canvas.current.width = container.current.clientWidth;
    canvas.current.height = container.current.clientHeight;

    const ctx = canvas.current.getContext('2d');
    if (!ctx) {
      return;
    }

    clearCanvas();
    if (props.rectsVisible) {
      redraw(ctx, refPoints.current, scaleInfo, dragInfo.current, undefined, currentRect);
    }
  }, [props.rectsVisible, scaleInfo, currentRect]);

  useEffect(() => {
    const resize = () => {
      resizeCanvas();
      initScaleInfo();
    };

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [props.rectsVisible, scaleInfo]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (container.current?.clientHeight !== canvas.current?.clientHeight) {
        resizeCanvas();
        initScaleInfo();
      }
    }, 100);
    return () => clearInterval(timer);
  }, [props.visible]);

  const onKeyDown = useCallback(
    (evt) => {
      if (!props.editable || currentRect < 0 || currentRect >= refPoints.current.length) return;
      if (evt.keyCode === KEY_DEL || evt.keyCode === KEY_P) {
        // Delete key pressed
        refPoints.current.splice(currentRect, 1);
        resizeCanvas();
        fireOnChange(refPoints.current);
        return;
      }

      if (evt.keyCode === KEY_L) {
        // resize to 2.0
        const p = refPoints.current[currentRect];
        ajustRect(p);
        p[2] = p[0] + (p[3] - p[1]) * 2;

        resizeCanvas();
        fireOnChange(refPoints.current);
        return;
      }
    },
    [scaleInfo, currentRect, props.editable],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  useEffect(() => {
    if (!canvas.current) {
      return;
    }
    const ctx = canvas.current.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(
      image.current!,
      scaleInfo.left,
      scaleInfo.top,
      canvas.current.width / scaleInfo.scale,
      canvas.current.height / scaleInfo.scale,
      0,
      0,
      canvas.current.width,
      canvas.current.height,
    );
    redraw(ctx, refPoints.current, scaleInfo, { ...dragInfo.current }, undefined, currentRect);
  }, [currentRect, scaleInfo]);

  useEffect(() => {
    refPoints.current = props.points;
    resizeCanvas();
  }, [props.points, scaleInfo, props.rectsVisible]);

  // 将鼠标坐标转换为图像真实坐标
  const getMousePosition = useCallback(
    (evt) => {
      let x = evt.clientX;
      let y = evt.clientY;
      const rect = canvas.current!.getBoundingClientRect();
      x -= rect.left;
      y -= rect.top;

      x /= scaleInfo.scale;
      y /= scaleInfo.scale;
      x += scaleInfo.left;
      y += scaleInfo.top;

      return [x, y];
    },
    [scaleInfo],
  );

  const onMouseMove = useCallback(
    (evt) => {
      if (!canvas.current || !image.current) {
        return;
      }

      const cursorPoint = getMousePosition(evt);
      if (dragInfo.current.dragActive) {
        // 需要修改points坐标
        let str = '';
        for (let i = 0; i < refPoints.current.length; i++) {
          str += refPoints.current[i];
          str += ' ,';
        }
        modifyPoints(dragInfo.current, refPoints.current, cursorPoint);
        str = '';
        for (let i = 0; i < refPoints.current.length; i++) {
          str += refPoints.current[i];
          str += ' ,';
        }
      } else if (dragInfo.current.dragImageActive && dragInfo.current.backupPoints) {
        onDrag([
          cursorPoint[0] - dragInfo.current.backupPoints[0],
          cursorPoint[1] - dragInfo.current.backupPoints[1],
        ]);
      }
      if (!props.rectsVisible) {
        return;
      }
      clearCanvas();
      if (props.rectsVisible) {
        redraw(
          canvas.current.getContext('2d'),
          refPoints.current,
          scaleInfo,
          dragInfo.current,
          cursorPoint,
          currentRect,
        );
      }
    },
    [props.rectsVisible, scaleInfo, currentRect],
  );

  const onMouseDown = useCallback(
    (evt) => {
      const clickIndex = getPointIndex(getMousePosition(evt), refPoints.current);
      if (clickIndex >= 0) {
        setCurrentRect(clickIndex);
      }

      if (dragInfo.current.processNewRect && props.editable) {
        const pt = getMousePosition(evt);
        dragInfo.current.processNewRect = false;
        fireOnChange([...refPoints.current, [...pt, pt[0] + 500, pt[1] + 250]]);
        return;
      }

      if (dragInfo.current.shapeIndex < 0 || dragInfo.current.pointIndex < 1) {
        dragInfo.current.dragImageActive = true;
        dragInfo.current.backupPoints = getMousePosition(evt);
        console.dir('begin drag Image');
        return;
      }

      if (!props.rectsVisible || !props.editable) {
        return;
      }
      if (!canvas.current || !image.current) {
        return;
      }

      if (dragInfo.current.shapeIndex < 0 || dragInfo.current.pointIndex < 1) {
        dragInfo.current.dragImageActive = true;
        dragInfo.current.backupPoints = getMousePosition(evt);
        console.dir('begin drag Image');
      } else {
        console.dir(`dragInfo.current.shapeIndex=${dragInfo.current.shapeIndex}`);
        dragInfo.current.dragActive = true;
        console.dir('begin drag rect');
      }
    },
    [props.rectsVisible, scaleInfo],
  );

  const onMouseUp = useCallback(() => {
    if (!props.rectsVisible) {
      return;
    }
    if (dragInfo.current.dragActive) {
      dragInfo.current.dragActive = false;
      fireOnChange(refPoints.current);
      console.dir('end drag rect');
    } else if (dragInfo.current.dragImageActive) {
      dragInfo.current.dragImageActive = false;
      console.dir('end drag image');
    }
  }, [props.rectsVisible, scaleInfo]);

  const onDrag = (point: number[]) => {
    console.dir(point);
    let { top, left, ...rest } = scaleInfo;
    left -= point[0];
    top -= point[1];
    setScaleInfo({
      ...rest,
      top,
      left,
    });
  };

  const onWheel = (e: any) => {
    console.log('wheel');
    if (e.nativeEvent.deltaY <= 0) {
      doZoomIn();
    } else {
      doZoomOut();
    }
  };

  const onNewRect = () => {
    dragInfo.current.processNewRect = true;
  };

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('onmouseup', onMouseUp);
    };
  }, [onMouseUp]);

  const doZoomIn = () => {
    // 放大
    const { scale, ...rest } = scaleInfo;
    setScaleInfo({
      ...rest,
      scale: scale + 0.1,
    });
  };
  const doZoomOut = () => {
    // 缩小
    let { scale, ...rest } = scaleInfo;
    scale -= 0.1;
    if (scale <= 0.1) {
      scale = 0.1;
    }
    setScaleInfo({
      ...rest,
      scale,
    });
  };

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginTop: '-10px', marginBottom: 5 }}>
        <Button size="small" style={{ marginRight: 5 }} onClick={onNewRect}>
          新建区域
        </Button>
        <Button
          size="small"
          style={{ marginRight: 5 }}
          icon={<CloseOutlined />}
          disabled={currentRect === -1}
          title="删除区域"
          onClick={() => {
            refPoints.current.splice(currentRect, 1);
            resizeCanvas();
            fireOnChange(refPoints.current);
          }}
          danger
        ></Button>
        {props.children}
      </div>
      <div ref={container} className={styles.container}>
        <canvas
          className={styles.canvas}
          ref={canvas}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onWheel={onWheel}
          onMouseUp={onMouseUp}
        />
        <img
          className={styles.image}
          onLoad={() => {
            resizeCanvas();
            initScaleInfo();
          }}
          ref={image}
          src={props.imageUrl}
        />
      </div>
    </div>
  );
}

const { Paragraph } = Typography;

const TaskList: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const actionRef = useRef<ActionType>();
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<API.Task | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [completedTasksCount, setCompletedTasksCount] = useState<number>(0);
  const [totalTasksCount, setTotalTasksCount] = useState<number>(0);
  const [taskData, setTaskData] = useState<API.Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // 获取当前用户信息
  const currentToken = initialState?.currentToken;
  const currentUserId = currentToken?.userId;
  const isAdmin = currentToken?.userCode === 'root' || 
                  (currentToken?.privSet && currentToken?.privSet.includes('admin'));
  
  useEffect(() => {
    if (!currentUserId) {
      message.warning('请先登录获取您的个人任务');
    }
  }, [currentUserId]);
  
  // 快速切换任务完成状态
  const toggleTaskStatus = async (task: API.Task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await updateTask(task.id!, updatedTask);
      message.success(`任务已${updatedTask.completed ? '完成' : '标记为未完成'}`);
      actionRef.current?.reload();
    } catch (error) {
      console.error('更新任务状态失败:', error);
      message.error('操作失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  const handleDelete = async (id: number | undefined) => {
    if (id === undefined) {
      message.error('任务ID不能为空');
      return;
    }

    // 确保 id 是数字类型
    const taskId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(taskId)) {
      message.error('无效的任务ID');
      return;
    }

    try {
      console.log('正在删除任务:', taskId);
      await deleteTask({ id: taskId });
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 批量删除任务
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的任务');
      return;
    }
    
    try {
      // 逐个删除所选任务
      const promises = selectedRowKeys.map(id => deleteTask({ id: Number(id) }));
      await Promise.all(promises);
      message.success(`成功删除${selectedRowKeys.length}个任务`);
      setSelectedRowKeys([]);
      actionRef.current?.reload();
    } catch (error) {
      message.error('批量删除失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 判断任务是否即将到期(3天内)
  const isTaskDueSoon = (dueDate: string) => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const columns: ProColumns<API.Task>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      render: (_, record) => (
        <a 
          onClick={() => {
            setCurrentTask(record);
            setFormVisible(true);
          }}
          style={{ 
            fontWeight: isTaskDueSoon(record.dueDate) && !record.completed ? 'bold' : 'normal' 
          }}
        >
          {record.title}
          {isTaskDueSoon(record.dueDate) && !record.completed && (
            <Tag color="warning" style={{ marginLeft: 8 }}>即将到期</Tag>
          )}
        </a>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'completed',
      valueEnum: {
        true: { text: '已完成', status: 'Success' },
        false: { text: '未完成', status: 'Default' },
      },
      render: (_, record) => (
        <Switch
          checked={record.completed}
          checkedChildren="已完成"
          unCheckedChildren="未完成"
          onChange={() => toggleTaskStatus(record)}
        />
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      valueType: 'date',
      sorter: true,
      render: (_, record) => {
        if (!record.dueDate) return '-';
        const isOverdue = new Date(record.dueDate) < new Date() && !record.completed;
        return (
          <span style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
            {record.dueDate}
            {isOverdue && <Tag color="error" style={{ marginLeft: 8 }}>已逾期</Tag>}
          </span>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentTask(record);
            setFormVisible(true);
          }}
        >
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确定删除此任务吗?"
          onConfirm={() => {
            if (record.id !== undefined) {
              handleDelete(record.id);
            } else {
              message.error('任务ID不存在');
            }
          }}
        >
          <a>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  // 任务卡片渲染
  const renderTaskCard = (task: API.Task) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
    const isDueSoon = isTaskDueSoon(task.dueDate) && !task.completed;
    
    return (
      <Card 
        key={task.id} 
        style={{ 
          marginBottom: 16,
          borderLeft: task.completed ? '4px solid #52c41a' : 
                      isOverdue ? '4px solid #ff4d4f' : 
                      isDueSoon ? '4px solid #faad14' : '4px solid #d9d9d9'
        }}
        actions={[
          <Checkbox
            checked={task.completed}
            onChange={() => toggleTaskStatus(task)}
          >
            {task.completed ? '已完成' : '完成'}
          </Checkbox>,
          <a onClick={() => {
            setCurrentTask(task);
            setFormVisible(true);
          }}>编辑</a>,
          <Popconfirm
            title="确定删除此任务吗?"
            onConfirm={() => handleDelete(task.id)}
          >
            <a>删除</a>
          </Popconfirm>
        ]}
      >
        <Card.Meta
          title={
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{ fontWeight: 'bold' }}>{task.title}</span>
                {isDueSoon && <Tag color="warning">即将到期</Tag>}
                {isOverdue && <Tag color="error">已逾期</Tag>}
              </div>
            </div>
          }
          description={
            <>
              <Paragraph ellipsis={{ rows: 2 }}>{task.description || '没有描述'}</Paragraph>
              <Space>
                {task.dueDate && <span>截止日期: {task.dueDate}</span>}
              </Space>
            </>
          }
        />
      </Card>
    );
  };

  useEffect(() => {
    if (viewMode === 'card') {
      loadCardData();
    }
  }, [viewMode]);
  
  // 添加卡片视图数据加载函数
  const loadCardData = async () => {
    setLoading(true);
    try {
      const pageParams = {
        pageNum: 1,
        pageSize: 100, // 加载更多数据用于卡片展示
        userId: isAdmin ? currentUserId : currentUserId,
      };
      
      const result = await listTasksByPage(pageParams);
      if (result && result.data) {
        setTaskData(result.data);
        setCompletedTasksCount(result.data.filter(task => task.completed).length);
        setTotalTasksCount(result.data.length);
      }
    } catch (error) {
      console.error('加载卡片数据失败:', error);
      message.error('加载任务数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTableDataLoaded = (data: API.Task[]) => {
    // 更新卡片数据，确保两种视图数据同步
    setTaskData(data);
    // 更新统计数据
    setCompletedTasksCount(data.filter(task => task.completed).length);
    setTotalTasksCount(data.length);
  };

  return (
    <PageContainer
      header={{
        title: '我的任务',
        subTitle: '管理您的所有任务',
      }}
      extra={[
        <Radio.Group 
          key="viewMode" 
          value={viewMode} 
          onChange={e => setViewMode(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="table"><TableOutlined /> 表格视图</Radio.Button>
          <Radio.Button value="card"><AppstoreOutlined /> 卡片视图</Radio.Button>
        </Radio.Group>
      ]}
    >
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Button
              type="primary"
              onClick={() => {
                setCurrentTask(undefined);
                setFormVisible(true);
              }}
              icon={<PlusOutlined />}
            >
              新建任务
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button 
                style={{ marginLeft: 8 }}
                danger
                onClick={handleBatchDelete}
                icon={<DeleteOutlined />}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
          </div>
          
          <Statistic 
            title="任务完成率" 
            value={`${Math.round(completedTasksCount / totalTasksCount * 100) || 0}%`} 
            suffix={`(${completedTasksCount}/${totalTasksCount})`}
          />
        </div>
        
        {viewMode === 'table' ? (
          <ProTable<API.Task>
            headerTitle={`任务列表 ${currentUserId ? `(用户ID: ${currentUserId})` : ''}`}
            actionRef={actionRef}
            rowKey="id"
            search={{
              labelWidth: 120,
              defaultCollapsed: false,
              optionRender: ({ searchText, resetText }, { form }) => [
                <Button
                  key="search"
                  type="primary"
                  onClick={() => form?.submit()}
                >
                  {searchText}
                </Button>,
                <Button
                  key="reset"
                  onClick={() => form?.resetFields()}
                >
                  {resetText}
                </Button>,
              ],
            }}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            request={async (params) => {
              const { current, pageSize, ...rest } = params;
              
              const pageParams = {
                pageNum: current || 1,
                pageSize: pageSize || 10,
                // 只有管理员才传递指定的userId参数，否则使用当前用户ID
                userId: isAdmin ? (rest.userId || currentUserId) : currentUserId,
                ...rest
              };
              
              console.log('任务查询参数:', pageParams);
              
              try {
                const result = await listTasksByPage(pageParams);
                console.log('任务查询结果:', result);
                
                // 存储任务完成情况统计并更新卡片数据
                if (result && result.data) {
                  handleTableDataLoaded(result.data);
                }
                
                return convertPageData(result);
              } catch (error) {
                console.error('查询任务失败:', error);
                if (error.response?.status === 403) {
                  message.error('您没有权限访问这些任务');
                }
                return {
                  data: [],
                  total: 0,
                  success: false,
                };
              }
            }}
            columns={columns}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            dateFormatter="string"
            toolBarRender={false}
          />
        ) : (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 3,
              xl: 3,
              xxl: 4,
            }}
            pagination={{
              pageSize: 12,
              onChange: (page) => {
                // 支持翻页
                console.log('切换到页码:', page);
              }
            }}
            dataSource={taskData}
            renderItem={renderTaskCard}
            loading={loading}
          />
        )}
      </Card>
      
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
