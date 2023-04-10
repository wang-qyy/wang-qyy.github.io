

## Getting Started

安装依赖,

```bash
$ yarn
```

启动项目

```bash
$ yarn start
```

## 目录结构

```html
├── app.tsx     // 项目入口文件，提供一些运行时配置
├── global.less // 全局样式
├── api         // 后端接口 开发时根据模块拆分不同的文件
│   ├── index.tsx  // 提供集中引用的入口
│   └── pub.ts    // 公共接口
├── components    // 原子组件（独立的，不掺杂任何业务逻辑的组件）
│   ├── XiuIcon  // 每个原子组件都是一个独立的目录，文件名遵循大驼峰
│   │   ├── index.tsx 组件目录中包含react结构和样式，保证其独立性
│   │   └── index.less 
│   └── index.tsx
├── modules         // 业务组件/模块  （独立的，但包含业务逻辑的组件）
│   └── index.tsx   // 结构与规范同原子组件
├── config         // 公共的配置项
│   ├── http.ts // 请求配置
│   └── urls.ts // 一些公共链接配置
├── hooks          // 公共的hooks，开发中存在的一些公共逻辑，可以抽离至此文件
│   └── index.tsx
├── typings          // ts的全局type
│   └── index.tsx
├── pages  // 页面结构位置
│   ├── Content  // 中心区域
│   │   ├── Aside  // 侧边栏
│   │   │   ├── index.less
│   │   │   └── index.tsx
│   │   ├── Main   
│   │   │   ├── BottomBar 
│   │   │   │   ├── index.less
│   │   │   │   └── index.tsx
│   │   │   ├── Canvas  
│   │   │   │   ├── index.less
│   │   │   │   └── index.tsx
│   │   │   ├── TopBar
│   │   │   │   ├── index.less
│   │   │   │   └── index.tsx
│   │   │   ├── index.less
│   │   │   └── index.tsx
│   │   ├── index.less
│   │   └── index.tsx
│   ├── Header
│   │   ├── index.less
│   │   └── index.tsx
│   ├── Layout
│   │   ├── index.less
│   │   └── index.tsx
│   ├── document.ejs
│   ├── index.less
│   └── index.tsx
├── store  // 状态管理库
│   ├── adapter // 抽象接口层，用于和组件直接交互
│   │   ├── useGlobalStatus.ts
│   │   └── useUserInfo.ts
│   ├── index.tsx
│   └── reducer //声明的 reducer
│       ├── globalStatus.ts
│       ├── templateInfo.ts
│       └── userInfo.ts
├── style // 公共less 用于存储一些变量和公共方法
│   ├── mixins.less
│   ├── theme.ts
│   └── variable.less
└── utils // 工具包，公共方法
    ├── index.tsx
    └── urlProps.ts

```

## 开发标准
#### css less 
1: 可使用css_module
2：classname尽量遵循BEM规范，避免多层嵌套
3: 可以尝试使用Tailwind.css

#### react hooks相关
1： 在开发单一业务时，尽量将一个最小可独立逻辑块抽离为一个hooks，主体逻辑通过组合单体逻辑实现业务。
2： 使用hooks，如果需要整合为一个独立的对象，则需要使用大驼峰，解构变量使用小驼峰

```jsx
import { useState } from 'react';

const State = useState(null)
const [state,setState] = useState(null)
```
