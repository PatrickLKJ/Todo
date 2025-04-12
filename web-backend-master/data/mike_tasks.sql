-- Mike的任务数据（用户ID假设为1）
-- 包含各种状态：完成/未完成，逾期/未逾期
-- 包含各种类型：工作/学习/生活/其他
-- 包含各种优先级：高/中/低

-- 获取当前日期（仅用于注释参考）
-- 假设当前日期是2024-06-05

-- =============== 工作类任务 ===============
-- 已完成的工作任务
INSERT INTO task (user_id, title, description, completed, due_date, priority, category) VALUES
(1, '完成项目文档', 'Mike要编写API文档和用户手册', 1, '2024-06-01', 'high', 'work'),
(1, '代码审查', '审查团队成员的代码提交', 1, '2024-06-02', 'medium', 'work'),
(1, '团队会议', '每周项目进度会议', 1, '2024-06-03', 'medium', 'work'),

-- 未完成未逾期的工作任务
(1, '系统部署', '部署新版本到生产环境', 0, '2024-06-20', 'high', 'work'),
(1, '性能优化', '优化数据库查询性能', 0, '2024-06-25', 'low', 'work'),
(1, '功能规划', '规划下一版本新功能', 0, '2024-06-28', 'medium', 'work'),
(1, 'Bug修复', '修复客户报告的关键bug', 0, '2024-06-15', 'high', 'work'),
(1, 'API设计', '设计新版本API接口', 0, '2024-06-22', 'medium', 'work'),

-- 未完成已逾期的工作任务
(1, '周报提交', '提交上周工作总结', 0, '2024-06-04', 'medium', 'work'),
(1, '项目提案', '制作客户项目提案', 0, '2024-05-30', 'high', 'work'),
(1, '代码重构', '重构用户认证模块', 0, '2024-06-01', 'low', 'work'),

-- =============== 学习类任务 ===============
-- 已完成的学习任务
(1, '完成React教程', '学习React基础知识', 1, '2024-05-28', 'high', 'study'),
(1, '读完编程书籍', '《Clean Code》阅读笔记', 1, '2024-06-01', 'medium', 'study'),
(1, '参加在线课程', 'Coursera机器学习课程', 1, '2024-06-03', 'medium', 'study'),

-- 未完成未逾期的学习任务
(1, '学习React Hooks', '完成React Hooks高级教程', 0, '2024-06-12', 'high', 'study'),
(1, '准备认证考试', '准备AWS解决方案架构师考试', 0, '2024-06-30', 'high', 'study'),
(1, '参加技术讲座', 'Web前端新技术分享会', 0, '2024-06-15', 'medium', 'study'),
(1, '完成算法练习', 'LeetCode每日一题', 0, '2024-06-10', 'medium', 'study'),
(1, '学习TypeScript', 'TypeScript高级特性学习', 0, '2024-06-25', 'low', 'study'),

-- 未完成已逾期的学习任务
(1, '提交学习总结', '五月学习内容总结', 0, '2024-05-31', 'low', 'study'),
(1, '完成编程作业', '实现一个简单的Todo应用', 0, '2024-06-01', 'medium', 'study'),
(1, '学习Docker', 'Docker基础知识学习', 0, '2024-06-02', 'low', 'study'),

-- =============== 生活类任务 ===============
-- 已完成的生活任务
(1, '健身房锻炼', '每周三次力量训练', 1, '2024-06-02', 'medium', 'life'),
(1, '超市购物', '购买日常用品和食材', 1, '2024-06-03', 'low', 'life'),
(1, '修理电脑', '更换笔记本硬盘', 1, '2024-05-30', 'high', 'life'),

-- 未完成未逾期的生活任务
(1, '购买生日礼物', '为朋友挑选生日礼物', 0, '2024-06-08', 'high', 'life'),
(1, '整理房间', '清理衣柜和书桌', 0, '2024-06-20', 'low', 'life'),
(1, '预约牙医', '定期牙齿检查', 0, '2024-06-18', 'medium', 'life'),
(1, '家庭聚会', '组织周末家庭聚会', 0, '2024-06-15', 'medium', 'life'),
(1, '修理汽车', '定期汽车保养', 0, '2024-06-25', 'medium', 'life'),

-- 未完成已逾期的生活任务
(1, '缴纳水电费', '缴纳本月水电费', 0, '2024-05-31', 'high', 'life'),
(1, '换季衣物整理', '整理冬季衣物', 0, '2024-06-01', 'low', 'life'),
(1, '健康体检', '年度健康体检', 0, '2024-06-03', 'high', 'life'),

-- =============== 其他类任务 ===============
-- 已完成的其他任务
(1, '更新社交账号', '更新LinkedIn个人资料', 1, '2024-05-28', 'low', 'other'),
(1, '捐赠旧书', '整理并捐赠旧书籍', 1, '2024-06-01', 'low', 'other'),
(1, '志愿者活动', '参加社区清洁活动', 1, '2024-06-02', 'medium', 'other'),

-- 未完成未逾期的其他任务
(1, '计划旅行', '制定暑假旅行计划', 0, '2024-06-25', 'medium', 'other'),
(1, '更新简历', '添加最新项目经验', 0, '2024-06-15', 'high', 'other'),
(1, '整理照片', '整理手机相册', 0, '2024-06-30', 'low', 'other'),
(1, '预约车辆保养', '5000公里定期保养', 0, '2024-06-22', 'medium', 'other'),
(1, '办理护照更新', '护照即将到期', 0, '2024-06-28', 'high', 'other'),

-- 未完成已逾期的其他任务
(1, '税务申报', '提交个人所得税申报', 0, '2024-05-31', 'high', 'other'),
(1, '整理数码设备', '整理旧手机和电子设备', 0, '2024-06-01', 'low', 'other'),
(1, '更新订阅服务', '更新即将到期的软件订阅', 0, '2024-06-03', 'medium', 'other');

-- 额外添加一些任务以确保数量足够翻页（假设每页10条，至少需要30-40条）
INSERT INTO task (user_id, title, description, completed, due_date, priority, category) VALUES
-- 工作任务补充
(1, '撰写项目报告', '撰写第二季度项目进度报告', 0, '2024-06-29', 'high', 'work'),
(1, '员工培训', '培训新员工使用公司系统', 0, '2024-06-24', 'medium', 'work'),
(1, '预算规划', '制定下半年项目预算', 0, '2024-07-05', 'high', 'work'),
(1, '客户会议', '与重要客户的季度回顾会议', 0, '2024-06-16', 'high', 'work'),
(1, '软件升级', '升级开发环境软件版本', 0, '2024-06-18', 'low', 'work'),

-- 学习任务补充
(1, '参加编程比赛', '参加公司内部编程挑战赛', 0, '2024-07-10', 'medium', 'study'),
(1, '学习新框架', '学习Vue.js 3.0新特性', 0, '2024-06-27', 'medium', 'study'),
(1, '写技术博客', '撰写React性能优化博客', 0, '2024-06-19', 'low', 'study'),
(1, '开源项目贡献', '为开源项目提交PR', 0, '2024-07-02', 'medium', 'study'),
(1, '订阅技术杂志', '续订年度技术杂志', 0, '2024-06-17', 'low', 'study'),

-- 生活任务补充
(1, '规划度假', '规划十月长假行程', 0, '2024-07-15', 'medium', 'life'),
(1, '购买新家具', '为书房购买新书桌', 0, '2024-06-23', 'low', 'life'),
(1, '宠物美容', '带猫咪去洗澡', 0, '2024-06-14', 'medium', 'life'),
(1, '植物浇水', '给家里植物浇水施肥', 0, '2024-06-10', 'low', 'life'),
(1, '亲友聚会', '组织同学聚会', 0, '2024-07-01', 'medium', 'life'),

-- 其他任务补充
(1, '参加讲座', '参加创业经验分享会', 0, '2024-06-20', 'low', 'other'),
(1, '慈善捐款', '参与慈善捐款活动', 0, '2024-06-25', 'medium', 'other'),
(1, '购买生日礼物', '为父亲购买生日礼物', 0, '2024-07-08', 'high', 'other'),
(1, '整理电子文件', '整理电脑文档备份', 0, '2024-06-30', 'low', 'other'),
(1, '更新密码', '更新所有重要账号密码', 0, '2024-06-12', 'high', 'other'); 