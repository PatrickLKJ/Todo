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
                        `due_date` DATE COMMENT '截止日期',
                        `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (`id`),
                        KEY `fk_user_id` (`user_id`),
                        CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=INNODB DEFAULT CHARSET=utf8;

-- ----------------------------
-- 初始测试数据
-- ----------------------------
-- 用户数据（密码都是123456的BCrypt加密值）
INSERT INTO `user` (username, password, nickname) VALUES
                                                      ('mike', '123456', '小明'),
                                                      ('lucy', '123456', '露西');

-- 任务数据
INSERT INTO `task` (user_id, title, description, due_date) VALUES
                                                               (1, '购买食材', '牛奶、鸡蛋、面包', '2024-05-30'),
                                                               (2, '完成React作业', '实现TodoList组件', '2024-05-28');