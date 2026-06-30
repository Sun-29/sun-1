# AI面试模拟系统 - API接口文档

Base URL: `http://localhost:3000/api`

## 认证说明

- 学生端API：Header `Authorization: Bearer <token>`
- 管理端API：Header `Authorization: Bearer <admin_token>`
- 公开API：无需认证

## 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

分页响应：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "pagination": { "total": 100, "page": 1, "pageSize": 10, "totalPages": 10 }
  }
}
```

---

## 一、认证模块 `/api/auth`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /auth/register | 用户注册 | 否 |
| POST | /auth/login | 用户登录 | 否 |
| POST | /auth/wechat-login | 微信登录 | 否 |
| POST | /auth/admin/login | 管理员登录 | 否 |
| POST | /auth/refresh-token | 刷新Token | 否 |

### POST /auth/login
```json
// Request
{ "account": "13800138001", "password": "123456" }
// Response
{ "code": 200, "message": "登录成功", "data": { "user": {...}, "token": "xxx", "refreshToken": "xxx" } }
```

### POST /auth/admin/login
```json
// Request
{ "username": "admin", "password": "admin123" }
// Response
{ "code": 200, "data": { "admin": {...}, "token": "xxx" } }
```

---

## 二、个人资料 `/api/profile`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /profile | 获取个人信息 | 学生 |
| PUT | /profile | 更新个人信息 | 学生 |
| PUT | /profile/change-password | 修改密码 | 学生 |
| POST | /profile/avatar | 上传头像 | 学生 |

---

## 三、岗位管理 `/api/positions`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /positions | 岗位列表 | 否 |
| GET | /positions/categories | 岗位分类统计 | 否 |
| GET | /positions/:id | 岗位详情 | 否 |
| POST | /positions | 新增岗位 | 管理员 |
| PUT | /positions/:id | 更新岗位 | 管理员 |
| DELETE | /positions/:id | 删除岗位 | 管理员 |

### GET /positions
参数：`?category=dev&keyword=Java&page=1&pageSize=10`

---

## 四、面试模块 `/api/interviews`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /interviews | 创建面试 | 学生 |
| GET | /interviews | 面试列表 | 学生 |
| GET | /interviews/:id | 面试详情 | 学生 |
| PUT | /interviews/:id/start | 开始面试 | 学生 |
| POST | /interviews/answer | 提交答案 | 学生 |
| POST | /interviews/:id/complete | 完成面试 | 学生 |
| GET | /interviews/:id/report | 面试报告 | 学生 |
| POST | /interviews/:id/skip | 跳过题目 | 学生 |

### POST /interviews
```json
{ "position_id": 1, "difficulty": "mid", "duration": 30, "question_count": 5 }
```

### POST /interviews/answer
```json
{ "interview_id": 1, "detail_id": 10, "answer": "我的回答内容...", "voice_url": null }
```

### POST /interviews/:id/complete
完成面试，AI生成综合报告，保存评分，发送通知。

---

## 五、题库模块 `/api/questions`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /questions | 题目列表 | 可选 |
| GET | /questions/random | 随机题目 | 可选 |
| GET | /questions/favorites | 收藏列表 | 学生 |
| GET | /questions/wrong | 错题列表 | 学生 |
| GET | /questions/:id | 题目详情 | 可选 |
| POST | /questions/:id/favorite | 切换收藏 | 学生 |
| POST | /questions/:id/review-wrong | 复习错题 | 学生 |
| PUT | /questions/:id/master-wrong | 标记掌握 | 学生 |

### GET /questions
参数：`?category_id=1&type=basic&difficulty=mid&keyword=Java&page=1&pageSize=10`

---

## 六、简历模块 `/api/resumes`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /resumes/upload | 上传简历 | 学生 |
| POST | /resumes/upload-and-analyze | 上传并分析 | 学生 |
| POST | /resumes/:id/analyze | 分析简历 | 学生 |
| GET | /resumes | 分析列表 | 学生 |
| GET | /resumes/:id | 分析详情 | 学生 |
| DELETE | /resumes/:id | 删除记录 | 学生 |

---

## 七、学习路线 `/api/learning`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /learning/generate | 生成路线 | 学生 |
| GET | /learning/current | 当前路线 | 学生 |
| GET | /learning | 路线列表 | 学生 |
| PUT | /learning/:id/progress | 更新进度 | 学生 |
| PUT | /learning/:id/complete | 完成路线 | 学生 |
| GET | /learning/recommendations | 学习建议 | 学生 |

---

## 八、项目深挖 `/api/projects`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /projects/drill | 创建项目深挖 | 学生 |
| POST | /projects/:id/answer | 提交回答 | 学生 |
| GET | /projects/history | 历史记录 | 学生 |

---

## 九、统计模块 `/api/stats`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /stats/overview | 学习概览 | 学生 |
| GET | /stats/daily | 每日统计 | 学生 |
| GET | /stats/categories | 岗位统计 | 学生 |
| GET | /stats/growth | 成长曲线 | 学生 |
| GET | /stats/radar | 雷达图数据 | 学生 |
| POST | /stats/record | 记录学习 | 学生 |

---

## 十、排行榜 `/api/rankings`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /rankings | 排行榜 | 否 |
| GET | /rankings/me | 我的排名 | 学生 |

参数：`?type=week|month|total&page=1&pageSize=20`

---

## 十一、消息通知 `/api/messages`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /messages | 消息列表 | 学生 |
| GET | /messages/unread-count | 未读数 | 学生 |
| PUT | /messages/:id/read | 标记已读 | 学生 |
| PUT | /messages/read-all | 全部已读 | 学生 |
| DELETE | /messages/:id | 删除消息 | 学生 |

---

## 十二、管理后台API `/api/admin/*`

全部需要管理员认证（`authenticateAdmin` 中间件）。

### 数据看板 `/api/admin/dashboard`
| GET | /stats | 核心统计数据 |
| GET | /user-trend | 用户增长趋势 |
| GET | /interview-trend | 面试趋势 |
| GET | /position-popularity | 岗位热度 |
| GET | /score-distribution | 分数分布 |
| GET | /recent-activities | 最近操作日志 |

### 用户管理 `/api/admin/users`
| GET | / | 用户列表（支持搜索/筛选/分页） |
| GET | /stats | 用户统计 |
| GET | /:id | 用户详情 |
| PUT | /:id/status | 启用/禁用用户 |
| DELETE | /:id | 删除用户 |

### 题库管理 `/api/admin/questions`
| GET | / | 题目列表 |
| GET | /categories | 分类列表 |
| POST | /categories | 新增分类 |
| PUT | /categories/:id | 更新分类 |
| DELETE | /categories/:id | 删除分类 |
| GET | /export | 导出题目 |
| GET | /:id | 题目详情 |
| POST | / | 新增题目 |
| PUT | /:id | 更新题目 |
| DELETE | /:id | 删除题目 |
| POST | /batch-import | 批量导入 |

### 面试管理 `/api/admin/interviews`
| GET | / | 面试列表 |
| GET | /stats | 面试统计 |
| GET | /export | 导出面试数据 |
| GET | /:id | 面试详情 |

### 简历管理 `/api/admin/resumes`
| GET | / | 简历分析列表 |
| GET | /:id | 分析详情 |
| DELETE | /:id | 删除记录 |
| GET | /:id/download | 下载简历 |

### 消息管理 `/api/admin/messages`
| POST | /broadcast | 群发通知 |
| GET | / | 消息列表 |

### 系统管理 `/api/admin/system`
| GET | /logs | 系统日志 |
| GET | /config | 系统配置 |
| PUT | /config | 更新配置 |

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 参数错误 |
| 401 | 未认证/token过期 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 部署说明

1. 安装 MySQL 8.0，执行 `database/init.sql`
2. 安装 Redis（可选）
3. 安装 MinIO（可选，默认使用本地文件存储）
4. 配置 `server/.env` 中的数据库、Redis、DeepSeek API Key
5. `cd server && npm install && npm run dev`
6. `cd admin && npm install && npm run dev`
7. 微信小程序：修改 `app.js` 中的 `baseUrl` 为服务器URL
