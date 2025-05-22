# 基于MongoDB和Node.js + Vue3的OA系统

## 项目介绍

这是一个基于MongoDB、Node.js和Vue3开发的办公自动化(OA)系统，采用前后端分离架构。系统提供用户认证、权限管理、工作流程、文档管理等核心功能。

## 技术栈

### 后端
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT认证
- Multer (文件上传)

### 前端
- Vue 3
- Vue Router
- Pinia
- Element Plus
- Axios

## 功能模块

- 用户认证与授权
- 组织架构管理
- 权限控制
- 工作流程管理
- 文档管理
- 通知与消息
- 日程管理
- 考勤管理

## 项目结构

```
oa-system/
├── client/                 # 前端Vue3项目
│   ├── public/             # 静态资源
│   └── src/                # 源代码
│       ├── api/            # API请求
│       ├── assets/         # 资源文件
│       ├── components/     # 公共组件
│       ├── layout/         # 布局组件
│       ├── router/         # 路由配置
│       ├── store/          # 状态管理
│       ├── utils/          # 工具函数
│       └── views/          # 页面组件
└── server/                 # 后端Node.js项目
    ├── config/             # 配置文件
    ├── controllers/        # 控制器
    ├── middleware/         # 中间件
    ├── models/             # 数据模型
    ├── routes/             # 路由
    └── utils/              # 工具函数
```

## 安装与运行

### 安装依赖

```bash
# 安装所有依赖（后端和前端）
npm run install:all
```

### 开发环境运行

```bash
# 同时运行前端和后端
npm run dev

# 仅运行后端
npm run dev:server

# 仅运行前端
npm run dev:client
```

### 生产环境构建

```bash
# 构建前端
npm run build

# 启动服务器
npm start
```

## 环境变量配置

在项目根目录创建 `.env` 文件，配置以下环境变量：

```
MONGO_URI=mongodb://localhost:27017/oa-system
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
```