-- 添加测试用户
INSERT INTO `user` (username, password, nickname) VALUES
('demo', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '演示用户');

-- 添加测试任务数据
INSERT INTO `task` (user_id, title, description, completed, due_date, priority, category) VALUES
-- 工作类任务
(1, '完成项目文档', '编写API文档和用户手册', 0, '2024-06-15', 'high', 'work'),
(1, '代码审查', '审查团队成员的代码提交', 0, '2024-06-10', 'medium', 'work'),
(1, '团队会议', '每周项目进度会议', 1, '2024-06-05', 'medium', 'work'),
(1, '系统部署', '部署新版本到生产环境', 0, '2024-06-20', 'high', 'work'),
(1, '性能优化', '优化数据库查询性能', 0, '2024-06-25', 'low', 'work'),

-- 学习类任务
(1, '学习React Hooks', '完成React Hooks教程', 0, '2024-06-12', 'high', 'study'),
(1, '准备期末考试', '复习数据结构与算法', 0, '2024-06-30', 'high', 'study'),
(1, '完成编程作业', '实现一个简单的Todo应用', 1, '2024-06-01', 'medium', 'study'),
(1, '阅读技术书籍', '《深入理解Java虚拟机》', 0, '2024-06-28', 'low', 'study'),
(1, '参加技术分享会', 'Web前端新技术分享', 0, '2024-06-15', 'medium', 'study'),

-- 生活类任务
(1, '购买生日礼物', '为朋友挑选生日礼物', 0, '2024-06-08', 'high', 'life'),
(1, '健身房锻炼', '每周三次力量训练', 1, '2024-06-05', 'medium', 'life'),
(1, '整理房间', '清理衣柜和书桌', 0, '2024-06-20', 'low', 'life'),
(1, '预约牙医', '定期牙齿检查', 0, '2024-06-18', 'medium', 'life'),
(1, '超市购物', '购买日常用品和食材', 1, '2024-06-03', 'low', 'life'),

-- 其他类任务
(1, '计划旅行', '制定暑假旅行计划', 0, '2024-06-25', 'medium', 'other'),
(1, '更新简历', '添加最新项目经验', 0, '2024-06-15', 'high', 'other'),
(1, '整理照片', '整理手机相册', 0, '2024-06-30', 'low', 'other'),
(1, '预约车辆保养', '5000公里定期保养', 0, '2024-06-22', 'medium', 'other'),
(1, '办理护照更新', '护照即将到期', 0, '2024-06-28', 'high', 'other'); 