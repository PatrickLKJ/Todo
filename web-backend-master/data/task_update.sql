-- 确保截止日期字段类型正确
ALTER TABLE task MODIFY COLUMN due_date VARCHAR(10) COMMENT '截止日期';

-- 添加优先级和分类字段
ALTER TABLE task 
ADD COLUMN priority VARCHAR(10) DEFAULT 'medium' COMMENT '优先级：high, medium, low',
ADD COLUMN category VARCHAR(20) DEFAULT NULL COMMENT '任务分类';

-- 更新已有数据设置默认优先级
UPDATE task SET priority = 'medium' WHERE priority IS NULL;
