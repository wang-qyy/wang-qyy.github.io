# Koa + React Fullstack App

基于 pnpm workspace 的全栈项目模板，Koa + TypeScript 提供 RESTful API，React 18 + Ant Design 5 构建可视化界面。

## 技术栈

| 层       | 技术                                            |
| -------- | ----------------------------------------------- |
| 服务端   | Koa + koa-router + TypeScript（tsx 热重载）     |
| 前端     | React 18 + Ant Design 5 + Vite                  |
| API 通信 | Axios + Vite proxy（`/api` → `localhost:3000`） |
| 路由     | react-router-dom v6                             |
| 包管理   | pnpm workspace monorepo                         |

## 项目目录

```
20260729112729/
├── .gitignore
├── README.md
├── package.json                       # 根 workspace 配置
├── pnpm-workspace.yaml                # pnpm monorepo 定义
├── tsconfig.base.json                 # 共享 TypeScript 配置
└── packages/
    ├── server/                        # 🔧 Koa 后端
    │   ├── .env.example                # 环境变量模板
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts               # 入口：路由 + 中间件 + 启动
    │       └── qiniu.ts               # 七牛云上传模块
    │
    └── client/                        # 🖥️ React 前端
        ├── index.html
        ├── package.json
        ├── tsconfig.json
        ├── vite-env.d.ts
        ├── vite.config.ts             # Vite + API 代理配置
        └── src/
            ├── main.tsx               # React 挂载入口
            ├── App.tsx                # 路由 + Antd ConfigProvider
            ├── api/
            │   └── index.ts           # Axios 封装 + 接口定义
            ├── layouts/
            │   └── MainLayout.tsx     # 侧边栏布局
            └── pages/
                ├── Home.tsx           # 首页（服务状态监控）
                ├── Users.tsx          # 用户管理（CRUD 表格）
                └── Upload.tsx         # 文件上传（拖拽批量上传到七牛）
```

## 快速开始

### 环境要求

- Node.js v22+
- pnpm v10+

### 安装与启动

```bash
# 1. 安装依赖
pnpm install

# 2. 同时启动前后端
pnpm dev

# 或者分别启动
pnpm dev:server   # 后端 → http://localhost:3000
pnpm dev:client   # 前端 → http://localhost:5173
```

## API 接口

| 方法     | 路径                 | 说明                                            |
| -------- | -------------------- | ----------------------------------------------- |
| `GET`    | `/api/health`        | 健康检查                                        |
| `GET`    | `/api/users`         | 获取用户列表                                    |
| `GET`    | `/api/users/:id`     | 获取单个用户                                    |
| `POST`   | `/api/users`         | 创建用户                                        |
| `DELETE` | `/api/users/:id`     | 删除用户                                        |
| `POST`   | `/api/upload/batch`  | 批量上传文件到七牛（form-data, field: `files`） |
| `POST`   | `/api/upload/single` | 单文件上传到七牛（form-data, field: `file`）    |

### 七牛云配置

复制 `packages/server/.env.example` 为 `.env`，填入七牛云凭证：

```bash
QINIU_ACCESS_KEY=your_access_key
QINIU_SECRET_KEY=your_secret_key
QINIU_BUCKET=your_bucket_name
QINIU_DOMAIN=https://cdn.yourdomain.com   # CDN 加速域名（可选）
QINIU_ZONE=Zone_z2                        # 存储区域，默认华南
```

存储区域可选值：`Zone_z0`（华东）、`Zone_z1`（华北）、`Zone_z2`（华南）、`Zone_na0`（北美）、`Zone_as0`（东南亚）。

### 上传限制

| 参数       | 限制                                                                               |
| ---------- | ---------------------------------------------------------------------------------- |
| 单文件大小 | 最大 50MB                                                                          |
| 批量文件数 | 最多 20 个                                                                         |
| 并发上传数 | 5 个/批                                                                            |
| 允许类型   | jpeg, png, gif, webp, svg, pdf, doc, docx, xls, xlsx, txt, csv, zip, rar, mp4, mp3 |

## 页面功能

- **首页（/）**：展示服务运行状态、运行时间等系统概览信息
- **用户管理（/users）**：支持用户列表查询、新增用户、删除用户等 CRUD 操作
- **文件上传（/upload）**：拖拽批量上传文件到七牛云，支持图片预览、URL 复制、成功/失败统计
