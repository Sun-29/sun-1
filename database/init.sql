-- ============================================
-- AI Interview Simulator System
-- Database Initialization Script
-- MySQL 8.0+
-- ============================================

CREATE DATABASE IF NOT EXISTS ai_interview
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE ai_interview;

-- ============================================
-- 1. 用户表
-- ============================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `openid` VARCHAR(100) NULL COMMENT '微信OpenID',
  `phone` VARCHAR(20) NULL COMMENT '手机号',
  `email` VARCHAR(100) NULL COMMENT '邮箱',
  `password_hash` VARCHAR(255) NULL COMMENT '密码哈希',
  `nickname` VARCHAR(50) DEFAULT '新用户' COMMENT '昵称',
  `avatar_url` VARCHAR(500) NULL COMMENT '头像URL',
  `school` VARCHAR(100) NULL COMMENT '学校',
  `major` VARCHAR(100) NULL COMMENT '专业',
  `grade` VARCHAR(20) NULL COMMENT '年级',
  `job_direction` VARCHAR(50) NULL COMMENT '求职方向',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1:正常 0:禁用',
  `last_login` DATE NULL COMMENT '最后登录日期',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_openid` (`openid`),
  UNIQUE INDEX `uk_phone` (`phone`),
  UNIQUE INDEX `uk_email` (`email`),
  INDEX `idx_status` (`status`),
  INDEX `idx_job_direction` (`job_direction`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 2. 管理员表
-- ============================================
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
  `email` VARCHAR(100) NULL COMMENT '邮箱',
  `role` VARCHAR(20) DEFAULT 'admin' COMMENT '角色 admin/superadmin',
  `avatar` VARCHAR(500) NULL COMMENT '头像',
  `status` TINYINT DEFAULT 1 COMMENT '状态 1:正常 0:禁用',
  `last_login` DATE NULL COMMENT '最后登录日期',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_username` (`username`),
  INDEX `idx_role` (`role`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- ============================================
-- 3. 岗位表
-- ============================================
DROP TABLE IF EXISTS `positions`;
CREATE TABLE `positions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '岗位名称',
  `category` VARCHAR(50) NOT NULL COMMENT '分类 dev/test/ops/product/data',
  `description` TEXT NULL COMMENT '岗位描述',
  `requirements` TEXT NULL COMMENT '岗位要求',
  `salary_range` VARCHAR(50) NULL COMMENT '薪资范围',
  `status` TINYINT DEFAULT 1 COMMENT '状态',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `icon` VARCHAR(255) NULL COMMENT '图标',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='岗位表';

-- ============================================
-- 4. 题目分类表
-- ============================================
DROP TABLE IF EXISTS `question_categories`;
CREATE TABLE `question_categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `parent_id` INT NULL COMMENT '父分类ID',
  `description` VARCHAR(500) NULL COMMENT '描述',
  `icon` VARCHAR(255) NULL COMMENT '图标',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_status` (`status`),
  CONSTRAINT `fk_qc_parent` FOREIGN KEY (`parent_id`) REFERENCES `question_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题目分类表';

-- ============================================
-- 5. 题目表
-- ============================================
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `category_id` INT NULL COMMENT '分类ID',
  `position_id` INT NULL COMMENT '岗位ID',
  `title` VARCHAR(500) NOT NULL COMMENT '题目标题',
  `content` TEXT NOT NULL COMMENT '题目内容',
  `type` ENUM('basic','scenario','project','open','behavioral','hr') DEFAULT 'basic' COMMENT '题目类型',
  `difficulty` ENUM('junior','mid','senior') DEFAULT 'junior' COMMENT '难度',
  `reference_answer` TEXT NULL COMMENT '参考答案',
  `tags` VARCHAR(500) NULL COMMENT '标签',
  `score` INT DEFAULT 10 COMMENT '默认分值',
  `usage_count` INT DEFAULT 0 COMMENT '使用次数',
  `status` TINYINT DEFAULT 1 COMMENT '状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_position_id` (`position_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_difficulty` (`difficulty`),
  INDEX `idx_status` (`status`),
  INDEX `idx_tags` (`tags`),
  FULLTEXT INDEX `ft_content` (`title`, `content`),
  CONSTRAINT `fk_q_category` FOREIGN KEY (`category_id`) REFERENCES `question_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_q_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='题目表';

-- ============================================
-- 6. 面试表
-- ============================================
DROP TABLE IF EXISTS `interviews`;
CREATE TABLE `interviews` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `position_id` INT NOT NULL COMMENT '岗位ID',
  `title` VARCHAR(200) NULL COMMENT '面试标题',
  `difficulty` ENUM('junior','mid','senior') DEFAULT 'junior' COMMENT '难度',
  `duration` INT DEFAULT 30 COMMENT '计划时长(分钟)',
  `question_count` INT DEFAULT 5 COMMENT '题目数量',
  `status` ENUM('pending','ongoing','completed','cancelled') DEFAULT 'pending' COMMENT '状态',
  `total_score` DECIMAL(5,1) NULL COMMENT '总分',
  `current_question_index` INT DEFAULT 0 COMMENT '当前题目索引',
  `ai_model` VARCHAR(50) DEFAULT 'deepseek' COMMENT 'AI模型',
  `started_at` DATE NULL COMMENT '开始日期',
  `finished_at` DATE NULL COMMENT '完成日期',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_position_id` (`position_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_difficulty` (`difficulty`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_i_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_i_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='面试表';

-- ============================================
-- 7. 面试详情表
-- ============================================
DROP TABLE IF EXISTS `interview_details`;
CREATE TABLE `interview_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `interview_id` INT NOT NULL COMMENT '面试ID',
  `question_id` INT NULL COMMENT '题目ID',
  `question_content` TEXT NOT NULL COMMENT '题目内容',
  `question_type` VARCHAR(30) NULL COMMENT '题目类型',
  `user_answer` TEXT NULL COMMENT '用户答案',
  `answer_type` ENUM('text','voice') DEFAULT 'text' COMMENT '回答方式',
  `voice_url` VARCHAR(500) NULL COMMENT '语音URL',
  `voice_duration` INT NULL COMMENT '语音时长(秒)',
  `ai_score` DECIMAL(5,1) NULL COMMENT 'AI评分',
  `ai_comment` TEXT NULL COMMENT 'AI点评',
  `ai_follow_up` TEXT NULL COMMENT 'AI追问',
  `ai_follow_up_answer` TEXT NULL COMMENT '追问回答',
  `question_order` INT NOT NULL COMMENT '题目序号',
  `is_follow_up` TINYINT DEFAULT 0 COMMENT '是否追问',
  `parent_detail_id` INT NULL COMMENT '父详情ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_interview_id` (`interview_id`),
  INDEX `idx_question_id` (`question_id`),
  INDEX `idx_parent_detail_id` (`parent_detail_id`),
  CONSTRAINT `fk_id_interview` FOREIGN KEY (`interview_id`) REFERENCES `interviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_id_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_id_parent` FOREIGN KEY (`parent_detail_id`) REFERENCES `interview_details` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='面试详情表';

-- ============================================
-- 8. 评分报告表
-- ============================================
DROP TABLE IF EXISTS `score_reports`;
CREATE TABLE `score_reports` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `interview_id` INT NOT NULL COMMENT '面试ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `total_score` DECIMAL(5,1) NOT NULL COMMENT '总分',
  `professional_score` DECIMAL(5,1) DEFAULT 0 COMMENT '专业知识分(40%)',
  `expression_score` DECIMAL(5,1) DEFAULT 0 COMMENT '表达能力分(20%)',
  `logic_score` DECIMAL(5,1) DEFAULT 0 COMMENT '逻辑思维分(20%)',
  `understanding_score` DECIMAL(5,1) DEFAULT 0 COMMENT '问题理解分(20%)',
  `strengths` TEXT NULL COMMENT '优点 JSON数组',
  `weaknesses` TEXT NULL COMMENT '不足 JSON数组',
  `suggestions` TEXT NULL COMMENT '建议 JSON数组',
  `radar_data` JSON NULL COMMENT '雷达图数据',
  `detailed_feedback` TEXT NULL COMMENT '详细反馈',
  `position_rank` INT NULL COMMENT '排名',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_interview_id` (`interview_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_total_score` (`total_score`),
  CONSTRAINT `fk_sr_interview` FOREIGN KEY (`interview_id`) REFERENCES `interviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评分报告表';

-- ============================================
-- 9. 简历分析表
-- ============================================
DROP TABLE IF EXISTS `resume_analyses`;
CREATE TABLE `resume_analyses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
  `file_name` VARCHAR(200) NULL COMMENT '文件名',
  `file_type` VARCHAR(20) NULL COMMENT '文件类型 pdf/docx',
  `analysis_result` JSON NULL COMMENT '分析结果',
  `overall_score` DECIMAL(5,1) NULL COMMENT '综合评分',
  `content_score` DECIMAL(5,1) NULL COMMENT '内容分',
  `format_score` DECIMAL(5,1) NULL COMMENT '格式分',
  `match_score` DECIMAL(5,1) NULL COMMENT '匹配分',
  `match_position` VARCHAR(100) NULL COMMENT '匹配岗位',
  `strengths` TEXT NULL COMMENT '优点',
  `weaknesses` TEXT NULL COMMENT '不足',
  `suggestions` TEXT NULL COMMENT '优化建议',
  `keywords` VARCHAR(500) NULL COMMENT '关键词',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_ra_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='简历分析表';

-- ============================================
-- 10. 学习路线表
-- ============================================
DROP TABLE IF EXISTS `learning_paths`;
CREATE TABLE `learning_paths` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `position_id` INT NULL COMMENT '岗位ID',
  `interview_id` INT NULL COMMENT '关联面试ID',
  `title` VARCHAR(200) NULL COMMENT '路线标题',
  `path_data` JSON NULL COMMENT '路线数据 JSON',
  `progress` INT DEFAULT 0 COMMENT '进度百分比',
  `total_steps` INT DEFAULT 0 COMMENT '总步骤数',
  `completed_steps` INT DEFAULT 0 COMMENT '已完成步骤数',
  `status` ENUM('active','completed','paused') DEFAULT 'active' COMMENT '状态',
  `started_at` DATE NULL COMMENT '开始日期',
  `completed_at` DATE NULL COMMENT '完成日期',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_position_id` (`position_id`),
  INDEX `idx_status` (`status`),
  CONSTRAINT `fk_lp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lp_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lp_interview` FOREIGN KEY (`interview_id`) REFERENCES `interviews` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习路线表';

-- ============================================
-- 11. 错题本表
-- ============================================
DROP TABLE IF EXISTS `wrong_questions`;
CREATE TABLE `wrong_questions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `question_id` INT NOT NULL COMMENT '题目ID',
  `interview_detail_id` INT NULL COMMENT '面试详情ID',
  `user_answer` TEXT NULL COMMENT '用户答案',
  `correct_answer` TEXT NULL COMMENT '正确答案',
  `ai_analysis` TEXT NULL COMMENT 'AI解析',
  `review_count` INT DEFAULT 0 COMMENT '复习次数',
  `mastered` TINYINT DEFAULT 0 COMMENT '是否掌握',
  `next_review_date` DATE NULL COMMENT '下次复习日期',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_question_id` (`question_id`),
  INDEX `idx_mastered` (`mastered`),
  INDEX `idx_next_review_date` (`next_review_date`),
  CONSTRAINT `fk_wq_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wq_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wq_detail` FOREIGN KEY (`interview_detail_id`) REFERENCES `interview_details` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='错题本表';

-- ============================================
-- 12. 消息通知表
-- ============================================
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `content` TEXT NULL COMMENT '内容',
  `type` ENUM('system','interview','resume','task') DEFAULT 'system' COMMENT '消息类型',
  `is_read` TINYINT DEFAULT 0 COMMENT '是否已读',
  `related_id` INT NULL COMMENT '关联记录ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_msg_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息通知表';

-- ============================================
-- 13. 排行榜表
-- ============================================
DROP TABLE IF EXISTS `rankings`;
CREATE TABLE `rankings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `total_score` DECIMAL(6,1) DEFAULT 0 COMMENT '总分',
  `practice_count` INT DEFAULT 0 COMMENT '练习次数',
  `growth_value` INT DEFAULT 0 COMMENT '成长值',
  `week_score` DECIMAL(5,1) DEFAULT 0 COMMENT '周得分',
  `month_score` DECIMAL(5,1) DEFAULT 0 COMMENT '月得分',
  `week_rank` INT NULL COMMENT '周排名',
  `month_rank` INT NULL COMMENT '月排名',
  `total_rank` INT NULL COMMENT '总排名',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_user_id` (`user_id`),
  INDEX `idx_week_rank` (`week_rank`),
  INDEX `idx_month_rank` (`month_rank`),
  INDEX `idx_total_rank` (`total_rank`),
  CONSTRAINT `fk_rank_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排行榜表';

-- ============================================
-- 14. 系统日志表
-- ============================================
DROP TABLE IF EXISTS `system_logs`;
CREATE TABLE `system_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL COMMENT '用户ID',
  `admin_id` INT NULL COMMENT '管理员ID',
  `action` VARCHAR(100) NOT NULL COMMENT '操作',
  `module` VARCHAR(50) NOT NULL COMMENT '模块',
  `description` VARCHAR(500) NULL COMMENT '描述',
  `ip` VARCHAR(50) NULL COMMENT 'IP地址',
  `user_agent` VARCHAR(500) NULL COMMENT 'User Agent',
  `method` VARCHAR(10) NULL COMMENT '请求方法',
  `url` VARCHAR(500) NULL COMMENT '请求URL',
  `request_body` TEXT NULL COMMENT '请求体',
  `response_status` INT NULL COMMENT '响应状态码',
  `duration_ms` INT NULL COMMENT '耗时(ms)',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_admin_id` (`admin_id`),
  INDEX `idx_module` (`module`),
  INDEX `idx_action` (`action`),
  INDEX `idx_created_at` (`created_at`),
  CONSTRAINT `fk_sl_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_sl_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统日志表';

-- ============================================
-- 15. 用户收藏表
-- ============================================
DROP TABLE IF EXISTS `user_favorites`;
CREATE TABLE `user_favorites` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `question_id` INT NOT NULL COMMENT '题目ID',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_user_question` (`user_id`, `question_id`),
  CONSTRAINT `fk_uf_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_uf_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

-- ============================================
-- 16. 面试录音表
-- ============================================
DROP TABLE IF EXISTS `interview_recordings`;
CREATE TABLE `interview_recordings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `interview_detail_id` INT NULL COMMENT '面试详情ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `file_url` VARCHAR(500) NOT NULL COMMENT '文件URL',
  `file_name` VARCHAR(200) NULL COMMENT '文件名',
  `duration` INT NULL COMMENT '时长(秒)',
  `file_size` INT NULL COMMENT '文件大小(字节)',
  `transcription` TEXT NULL COMMENT '语音转文字结果',
  `status` ENUM('pending','processing','completed','failed') DEFAULT 'pending' COMMENT '处理状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_interview_detail_id` (`interview_detail_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  CONSTRAINT `fk_ir_detail` FOREIGN KEY (`interview_detail_id`) REFERENCES `interview_details` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ir_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='面试录音表';

-- ============================================
-- 17. 学习记录表
-- ============================================
DROP TABLE IF EXISTS `learning_records`;
CREATE TABLE `learning_records` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT '用户ID',
  `date` DATE NOT NULL COMMENT '日期',
  `practice_count` INT DEFAULT 0 COMMENT '练习次数',
  `total_duration` INT DEFAULT 0 COMMENT '总时长(秒)',
  `avg_score` DECIMAL(5,1) DEFAULT 0 COMMENT '平均分',
  `question_count` INT DEFAULT 0 COMMENT '做题数量',
  `interview_count` INT DEFAULT 0 COMMENT '面试次数',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_user_date` (`user_id`, `date`),
  CONSTRAINT `fk_lr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习记录表';

-- ============================================
-- 18. 用户反馈表
-- ============================================
DROP TABLE IF EXISTS `feedback`;
CREATE TABLE `feedback` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL COMMENT '用户ID',
  `content` TEXT NOT NULL COMMENT '反馈内容',
  `images` VARCHAR(1000) NULL COMMENT '图片URL 逗号分隔',
  `contact` VARCHAR(100) NULL COMMENT '联系方式',
  `status` ENUM('pending','reviewed','resolved') DEFAULT 'pending' COMMENT '处理状态',
  `admin_reply` TEXT NULL COMMENT '管理员回复',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  CONSTRAINT `fk_fb_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户反馈表';

-- ============================================
-- 种子数据
-- ============================================

-- 管理员账号 (密码: admin123, bcrypt hash)
INSERT INTO `admins` (`username`, `password_hash`, `email`, `role`, `status`) VALUES
('admin', '$2a$10$L0dSf9JwKcHQvEgawVzB1uMmZVnaNAovn5YZL8k6/xXAXm9Tckv8i', 'admin@ai-interview.com', 'admin', 1),
('superadmin', '$2a$10$L0dSf9JwKcHQvEgawVzB1uMmZVnaNAovn5YZL8k6/xXAXm9Tckv8i', 'super@ai-interview.com', 'superadmin', 1);

-- 测试用户 (密码: 123456)
INSERT INTO `users` (`phone`, `email`, `password_hash`, `nickname`, `school`, `major`, `grade`, `job_direction`) VALUES
('13800138001', 'test1@example.com', '$2a$10$0wwChrVsqtIzG4MRBpDp3ed36A6AFMmxNwjzgoCyV9PMZtBZVcjFu', '张三', '清华大学', '计算机科学与技术', '大四', '开发'),
('13800138002', 'test2@example.com', '$2a$10$0wwChrVsqtIzG4MRBpDp3ed36A6AFMmxNwjzgoCyV9PMZtBZVcjFu', '李四', '北京大学', '软件工程', '大三', '测试'),
('13800138003', 'test3@example.com', '$2a$10$0wwChrVsqtIzG4MRBpDp3ed36A6AFMmxNwjzgoCyV9PMZtBZVcjFu', '王五', '浙江大学', '数据科学', '研二', '数据');

-- 岗位数据
INSERT INTO `positions` (`name`, `category`, `description`, `requirements`, `salary_range`, `status`, `sort_order`) VALUES
('Java开发工程师', 'dev', '负责Java后端服务的设计、开发和维护', '熟悉Java、Spring Boot、MySQL、Redis等', '15K-30K', 1, 1),
('Python开发工程师', 'dev', '负责Python后端开发和数据处理', '熟悉Python、Django/Flask、数据库等', '15K-28K', 1, 2),
('前端开发工程师', 'dev', '负责Web前端页面开发', '熟悉HTML/CSS/JS、Vue/React等', '12K-25K', 1, 3),
('Android开发工程师', 'dev', '负责Android客户端开发', '熟悉Java/Kotlin、Android SDK等', '15K-30K', 1, 4),
('软件测试工程师', 'test', '负责软件功能测试和质量保证', '熟悉测试理论、自动化测试工具等', '10K-20K', 1, 5),
('自动化测试工程师', 'test', '负责自动化测试框架搭建和执行', '熟悉Selenium、JMeter、Python等', '12K-22K', 1, 6),
('Linux运维工程师', 'ops', '负责Linux服务器运维管理', '熟悉Linux、Shell、Docker等', '12K-25K', 1, 7),
('云计算工程师', 'ops', '负责云平台架构和运维', '熟悉AWS/Azure、K8s、Terraform等', '18K-35K', 1, 8),
('产品经理', 'product', '负责产品规划和需求分析', '熟悉产品设计、用户研究、数据分析等', '15K-30K', 1, 9),
('数据分析师', 'data', '负责数据分析和可视化', '熟悉SQL、Python、BI工具等', '12K-25K', 1, 10);

-- 题目分类
INSERT INTO `question_categories` (`name`, `parent_id`, `description`, `sort_order`) VALUES
('Java', NULL, 'Java相关面试题', 1),
('Python', NULL, 'Python相关面试题', 2),
('MySQL', NULL, 'MySQL数据库面试题', 3),
('Redis', NULL, 'Redis缓存面试题', 4),
('Vue', NULL, 'Vue前端面试题', 5),
('React', NULL, 'React前端面试题', 6),
('Linux', NULL, 'Linux运维面试题', 7),
('测试', NULL, '软件测试面试题', 8),
('产品', NULL, '产品经理面试题', 9),
('数据分析', NULL, '数据分析面试题', 10);

-- 子分类
INSERT INTO `question_categories` (`name`, `parent_id`, `description`, `sort_order`) VALUES
('Spring Boot', 1, 'Spring Boot框架', 1),
('JVM', 1, 'Java虚拟机', 2),
('并发编程', 1, 'Java并发', 3);

-- 示例题目
INSERT INTO `questions` (`category_id`, `position_id`, `title`, `content`, `type`, `difficulty`, `reference_answer`, `tags`, `score`) VALUES
(1, 1, '什么是面向对象编程？', '请解释面向对象编程的三大特性：封装、继承和多态，并举例说明。', 'basic', 'junior', '封装是将数据和操作封装在类中，隐藏内部实现；继承是子类继承父类的属性和方法；多态是同一接口不同实现。', 'Java,基础,OOP', 10),
(1, 1, 'HashMap的实现原理', '请详细说明HashMap的底层数据结构和工作原理，包括JDK 1.8的优化。', 'basic', 'mid', 'HashMap基于数组+链表+红黑树实现，通过hash函数计算索引，冲突时使用链表法，链表长度>8时转红黑树。', 'Java,集合,HashMap', 15),
(11, 1, 'Spring Boot自动配置原理', '请解释Spring Boot的自动配置是如何工作的？', 'basic', 'mid', '@SpringBootApplication包含@EnableAutoConfiguration，通过spring.factories加载自动配置类，@Conditional条件注解按需加载。', 'Spring,SpringBoot,自动配置', 15),
(1, 1, '如何解决Redis缓存穿透？', '请说明缓存穿透的概念以及解决方案。', 'scenario', 'senior', '缓存穿透是查询不存在的数据。解决方案：1.布隆过滤器 2.缓存空值 3.参数校验。', 'Redis,缓存,穿透', 15),
(1, 1, '介绍一个你参与过的项目', '请详细介绍你参与过的一个项目，包括技术栈、架构设计、你的职责等。', 'project', 'mid', '回答应包含项目背景、技术选型、架构设计、核心功能、个人贡献、遇到的挑战和解决方案。', '项目,经验', 20),
(2, 2, 'Python的GIL是什么？', '请解释Python的全局解释器锁(GIL)的概念及影响。', 'basic', 'mid', 'GIL是CPython中的互斥锁，保证同一时刻只有一个线程执行Python字节码，影响多线程CPU密集型任务性能。', 'Python,GIL', 10),
(3, 1, 'MySQL索引优化原则', '请说明MySQL索引的优化策略和注意事项。', 'basic', 'mid', '最左前缀原则、选择区分度高的列、避免在索引列上使用函数、覆盖索引、联合索引等。', 'MySQL,索引,优化', 15),
(4, 1, 'Redis数据类型及应用场景', '请列举Redis的主要数据类型并说明各自的应用场景。', 'basic', 'junior', 'String(缓存)、Hash(对象存储)、List(消息队列)、Set(去重)、ZSet(排行榜)。', 'Redis,数据类型', 10),
(5, 3, 'Vue3与Vue2的区别', '请说明Vue3相比Vue2的主要改进。', 'basic', 'junior', 'Composition API、响应式系统(Proxy)、Teleport、Fragments、更好的TS支持、Tree-shaking。', 'Vue,Vue3', 10),
(7, 7, 'Linux常用命令有哪些？', '请列举并说明Linux系统管理常用的命令。', 'basic', 'junior', 'ls/cd/cp/mv/rm(文件管理)、ps/top/kill(进程)、chmod/chown(权限)、grep/find(搜索)、tar/gzip(压缩)。', 'Linux,命令', 10),
(1, 1, '描述一次你解决复杂技术问题的经历', '请描述你在项目开发中遇到的一个复杂技术问题以及你是如何解决的。', 'open', 'mid', '考察问题分析和解决能力，回答应包含：问题现象、分析过程、解决步骤、经验总结。', '问题解决,经验', 20),
(1, 1, '你如何处理工作中的压力？', '请谈谈你在面对高强度工作压力时的应对方式。', 'behavioral', 'junior', '考察抗压能力和情绪管理，应展示积极的应对策略和具体案例。', '行为面试,压力管理', 15),
(1, 1, '你为什么选择我们公司？', '请说明你对我们公司的了解以及选择我们的原因。', 'hr', 'junior', '考察求职动机和企业文化匹配度，应展示对公司的了解和职业规划。', 'HR,求职动机', 15),
(4, 1, 'Redis缓存和数据库双写一致性方案', '请说明如何保证Redis缓存与数据库的数据一致性。', 'scenario', 'senior', '1.先更新数据库再删除缓存 2.延迟双删 3.订阅binlog+消息队列 4.分布式事务。', 'Redis,一致性,双写', 15),
(3, 1, 'MySQL事务隔离级别', '请说明MySQL的四种事务隔离级别及各自解决的问题。', 'basic', 'mid', 'READ UNCOMMITTED、READ COMMITTED、REPEATABLE READ(默认)、SERIALIZABLE。解决脏读、不可重复读、幻读。', 'MySQL,事务,隔离级别', 15),
(5, 3, 'Vue组件通信方式', '请列举Vue中组件间通信的多种方式。', 'basic', 'junior', 'props/emit、provide/inject、eventBus、Vuex/Pinia、ref/defineExpose、attrs。', 'Vue,组件通信', 10),
(6, 3, 'React Hooks使用规则', '请说明React Hooks的使用规则和常见Hook。', 'basic', 'mid', '规则：1.只在顶层调用 2.只在函数组件中使用。常见：useState、useEffect、useContext、useMemo、useCallback、useRef。', 'React,Hooks', 10),
(8, 5, '黑盒测试和白盒测试的区别', '请说明黑盒测试和白盒测试的概念和区别。', 'basic', 'junior', '黑盒测试关注功能需求，不关注内部结构；白盒测试关注内部逻辑结构，需要了解代码。', '测试,黑盒,白盒', 10),
(10, 10, '数据分析的基本流程', '请描述数据分析的标准流程。', 'basic', 'junior', '1.明确问题 2.数据收集 3.数据清洗 4.数据分析/建模 5.数据可视化 6.报告撰写。', '数据分析,流程', 10),
(9, 9, '如何进行需求分析？', '请说明产品经理进行需求分析的方法论。', 'scenario', 'mid', '1.用户访谈 2.竞品分析 3.数据分析 4.用户画像 5.需求优先级排序(Kano模型/MoSCoW)。', '产品,需求分析', 15);
