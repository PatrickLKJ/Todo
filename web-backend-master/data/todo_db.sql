-- 设置数据库名称为todo_db
CREATE DATABASE IF NOT EXISTS `todo_db` DEFAULT CHARSET utf8;
USE `todo_db`;

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- 核心表1：用户表（保留基础登录功能）
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
                        `id` INT(11) NOT NULL AUTO_INCREMENT,
                        `username` VARCHAR(40) NOT NULL COMMENT '登录账号',
                        `password` VARCHAR(60) NOT NULL COMMENT '加密后的密码',
                        `nickname` VARCHAR(32) DEFAULT '新用户' COMMENT '显示名称',
                        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (`id`),
                        UNIQUE KEY `uniq_username` (`username`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;

-- ----------------------------
-- 核心表2：任务表（你的tasks表改造）
-- ----------------------------
DROP TABLE IF EXISTS `task`;
CREATE TABLE `task` (
                        `id` INT(11) NOT NULL AUTO_INCREMENT,
                        `user_id` INT(11) NOT NULL COMMENT '所属用户ID',
                        `title` VARCHAR(255) NOT NULL,
                        `description` TEXT,
                        `completed` TINYINT(1) DEFAULT 0 COMMENT '是否完成',
                        `due_date` VARCHAR(10) COMMENT '截止日期',
                        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                        `priority` VARCHAR(10) DEFAULT 'medium' COMMENT '优先级：high, medium, low',
                        `category` VARCHAR(20) DEFAULT NULL COMMENT '任务分类',
                        PRIMARY KEY (`id`),
                        KEY `fk_user_id` (`user_id`),
                        CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;

-- ----------------------------
-- 初始测试数据
-- ----------------------------
INSERT INTO `user` (username, password, nickname) VALUES
('mike', '123456', '小明'),
('lucy', '123456', '露西'),
('demo', '123456', '演示用户');

-- 任务数据
INSERT INTO `task` (user_id, title, description, completed, due_date, priority, category) VALUES
-- 工作类任务
(1, '完成项目文档', '编写API文档和用户手册', 0, '2024-06-15', 'high', 'work'),
(1, '代码审查', '审查团队成员的代码提交', 0, '2024-06-10', 'medium', 'work'),
(1, '团队会议', '每周项目进度会议', 1, '2024-06-05', 'medium', 'work'),
(1, '系统部署', '部署新版本到生产环境', 0, '2024-06-20', 'high', 'work'),
(1, '性能优化', '优化数据库查询性能', 0, '2024-06-25', 'low', 'work'),

-- 学习类任务
(2, '学习React Hooks', '完成React Hooks教程', 0, '2024-06-12', 'high', 'study'),
(2, '准备期末考试', '复习数据结构与算法', 0, '2024-06-30', 'high', 'study'),
(2, '完成编程作业', '实现一个简单的Todo应用', 1, '2024-06-01', 'medium', 'study'),
(2, '阅读技术书籍', '《深入理解Java虚拟机》', 0, '2024-06-28', 'low', 'study'),
(2, '参加技术分享会', 'Web前端新技术分享', 0, '2024-06-15', 'medium', 'study'),

-- 生活类任务
(3, '购买生日礼物', '为朋友挑选生日礼物', 0, '2024-06-08', 'high', 'life'),
(3, '健身房锻炼', '每周三次力量训练', 1, '2024-06-05', 'medium', 'life'),
(3, '整理房间', '清理衣柜和书桌', 0, '2024-06-20', 'low', 'life'),
(3, '预约牙医', '定期牙齿检查', 0, '2024-06-18', 'medium', 'life'),
(3, '超市购物', '购买日常用品和食材', 1, '2024-06-03', 'low', 'life'),

-- 其他类任务
(3, '计划旅行', '制定暑假旅行计划', 0, '2024-06-25', 'medium', 'other'),
(3, '更新简历', '添加最新项目经验', 0, '2024-06-15', 'high', 'other'),
(3, '整理照片', '整理手机相册', 0, '2024-06-30', 'low', 'other'),
(3, '预约车辆保养', '5000公里定期保养', 0, '2024-06-22', 'medium', 'other'),
(3, '办理护照更新', '护照即将到期', 0, '2024-06-28', 'high', 'other');