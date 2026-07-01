# AI面试模拟系统 (AI Interview Simulator)

基于大语言模型（LLM）的智能面试模拟与能力评估系统，帮助大学生和求职者进行面试训练、简历优化、技术能力评估和学习路线规划。

## 项目结构

```
ai-interview-simulator/
├── miniprogram/          # 微信小程序端
│   ├── pages/            # 15个页面
│   ├── components/       # 公共组件
│   ├── utils/            # 工具函数
│   ├── styles/           # 全局样式
│   ├── app.js            # 小程序入口
│   ├── app.json          # 小程序配置
│   └── project.config.json
├── admin/                # Vue3管理后台
│   ├── src/
│   │   ├── views/        # 10个管理页面
│   │   ├── router/       # 路由配置
│   │   ├── stores/       # Pinia状态管理
│   │   ├── api/          # API接口封装
│   │   └── styles/       # 全局样式
│   ├── package.json
│   └── vite.config.js
├── server/               # Node.js后端
│   ├── src/
│   │   ├── controllers/  # 17个控制器
│   │   ├── models/       # 18个数据模型
│   │   ├── routes/       # 16个路由模块
│   │   ├── middleware/    # 5个中间件
│   │   ├── services/     # 5个服务层
│   │   ├── config/       # 配置文件
│   │   ├── utils/        # 工具函数
│   │   └── app.js        # 应用入口
│   ├── package.json
│   └── .env
├── database/
│   └── init.sql          # 数据库初始化脚本(18张表+种子数据)
└── docs/
    └── API.md            # API接口文档
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 小程序端 | 微信原生开发 (WXML + WXSS + JavaScript) |
| 管理后台 | Vue3 + Vite + Element Plus + Pinia + ECharts |
| 后端 | Node.js + Express + Sequelize |
| 数据库 | MySQL 8.0 |
| 缓存 | Redis |
| 文件存储 | MinIO (可降级为本地存储) |
| AI服务 | DeepSeek API |

## 快速开始

### 1. 数据库初始化

```bash
# 导入数据库
mysql -u root -p < database/init.sql
```

默认创建：
- 管理员账号：admin / admin123
- 测试用户：13800138001 / 123456

### 2. 后端启动

```bash
cd server
npm install
# 修改 .env 中的数据库配置和DeepSeek API Key
npm run dev
```

服务运行在 http://localhost:3000
API文档：http://localhost:3000/api-docs

### 3. 管理后台启动

```bash
cd admin
npm install
npm run dev
```

访问 http://localhost:5173
管理员登录：admin / admin123

### 4. 微信小程序

1. 下载微信开发者工具
2. 导入 `miniprogram` 目录
3. 修改 `app.js` 中的 `baseUrl` 为你的服务器地址
4. 预览/上传

## 功能模块

### 用户端（微信小程序）
- 🔐 登录注册（手机号/微信/邮箱）
- 🎯 AI模拟面试（选择岗位+难度，AI自动出题）
- 🎤 语音/文字回答
- 🔍 AI连续追问
- 📊 智能评分报告（专业/表达/逻辑/理解四维度）
- 📄 简历上传与分析
- 💡 项目深挖训练
- 🗺️ 个性化学习路线
- 📚 题库练习+收藏
- ❌ 错题本
- 📈 学习数据统计
- 🏆 排行榜

### 管理后台
- 📊 数据看板（ECharts可视化）
- 👥 用户管理
- 💼 岗位管理
- 📝 题库管理（含分类管理+批量导入）
- 🎬 面试记录查看
- 📄 简历管理
- 📋 评分报告
- 🔔 消息推送
- ⚙️ 系统设置+操作日志

## 数据库表（18张）

users, admins, positions, question_categories, questions, interviews, interview_details, score_reports, resume_analyses, learning_paths, wrong_questions, messages, rankings, system_logs, user_favorites, interview_recordings, learning_records, feedback

## 测试账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 管理员 | admin | admin123 |
| 超级管理员 | superadmin | admin123 |
| 学生 | 13800138001 | 123456 |

## 环境要求

- Node.js >= 16
- MySQL >= 8.0
- Redis >= 6.0 (可选)
- MinIO (可选，文件存储)
- DeepSeek API Key
- 微信开发者工具

## 后续扩展

- 集成语音识别服务（如腾讯云ASR）
- 视频面试功能
- 多人对战模式
- 企业招聘对接
- 更丰富的题库
- 移动端适配PWA
<img width="1206" height="2622" alt="bd35988ffbae13c4e1a06510e820674a" src="https://github.com/user-attachments/assets/32428bdf-e826-4232-9caf-2606814a9d71" />
