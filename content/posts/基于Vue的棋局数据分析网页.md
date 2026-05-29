---
title: 基于Vue的棋局数据分析网页
date: 2025-10-28 16:25:41
tags: [Vue, 棋局数据分析, 前端开发]
---

# 围棋分析系统

从25年1月初开始学围棋，基本上在野狐围棋上对局。但是苦于野狐围棋并没有个人的黑棋白棋胜率及更多的分析数据，于是想自己实现一个基于Vue的棋局数据分析网页

## 项目概述
这是一个基于Vue 3构建的围棋对局分析系统，用于记录、管理和分析围棋对局。系统支持SGF文件导入、对局数据存储、胜率统计分析以及棋局详情查看等功能

## 技术栈

- **前端框架**: Vue 3 + Vite
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **数据可视化**: Chart.js
- **本地存储**: IndexedDB (通过idb库)
- **SGF解析**: @sabaki/sgf
- **语言**: TypeScript
- **构建工具**: Vite

## 项目结构

```
├── src/
│   ├── assets/           # 静态资源
│   ├── components/       # 组件
│   ├── lib/              # 工具函数库
│   ├── router/           # 路由配置
│   ├── stores/           # 状态管理
│   ├── types/            # 类型定义
│   ├── views/            # 页面组件
│   ├── App.vue           # 应用根组件
│   └── main.ts           # 入口文件
├── public/               # 公共资源
├── .vscode/              # VSCode配置
├── tsconfig.json         # TypeScript配置
├── vite.config.ts        # Vite配置
└── package.json          # 项目依赖
```

## 核心功能模块

### 1. 数据存储模块
- 使用IndexedDB存储对局数据
- 提供完整的增删改查操作
- 通过idb库简化IndexedDB操作

### 2. SGF解析模块
- 解析SGF格式的对局记录
- 提取对局元数据（日期、对局者、结果等）
- 提取手数、让子、贴目等信息

### 3. 对局管理模块
- 添加对局（支持SGF文件导入）
- 查看对局列表和详情
- 删除对局记录
- 筛选和排序功能

### 4. 数据统计模块
- 计算并展示总对局数
- 统计黑棋和白棋胜率
- 展示胜率趋势图表

## 关键文件说明

### 1. 数据存储
- **src/lib/db.ts**: 数据库初始化和配置
```typescript
import { openDB } from 'idb';

export const initDB = async () => {
  return openDB('GoDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('games')) {
        const store = db.createObjectStore('games', { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date');
        store.createIndex('color', 'color');
        store.createIndex('result', 'result');
      }
    }
  });
};
```

### 2. 状态管理
- **src/stores/games.ts**: 棋局数据的状态管理
  - 存储棋局列表
  - 提供数据计算（胜率、弱点分析等）
  - 封装数据库操作

### 3. SGF解析
- **src/lib/sgf.ts**: SGF文件解析工具
  - 解析SGF字符串
  - 提取对局信息和手数

### 4. 页面组件
- **GameList.vue**: 对局列表页面
- **GameDetail.vue**: 对局详情页面
- **AddGame.vue**: 添加对局页面
- **Statistics.vue**: 数据统计页面

## 路由配置

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/game-list',
      name: 'game-list',
      component: () => import('../views/GameList.vue'),
    },
    {
      path: '/add-game',
      name: 'add-game',
      component: () => import('../views/AddGame.vue'),
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/Statistics.vue'),
    },
    {
      path: '/game/:id',
      name: 'game-detail',
      component: () => import('../views/GameDetail.vue'),
    },
  ],
})

export default router
```

## 核心数据类型

### Game接口
```typescript
export interface Game {
  id?: number;
  date: string;
  color: 'black' | 'white';
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  sgf: string;
  createdAt: string;
  analysis?: {
    winRate: number[];
    mistakes: { move: number; position: string; severity: number }[];
  };
}
```

## 使用说明

### 安装依赖
```bash
npm install
```

### 开发模式启动
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 功能说明

### 添加对局
1. 点击"添加对局"导航
2. 选择SGF格式的对局文件
3. 系统自动解析对局信息
4. 确认信息无误后保存对局

### 查看对局列表
1. 点击"对局列表"导航
2. 可根据结果和颜色进行筛选
3. 列表显示对局的关键信息，包括日期、颜色、对手、手数、让子和结果
4. 点击"查看"按钮进入对局详情
5. 点击"删除"按钮删除对局

### 查看统计数据
1. 点击"统计"导航
2. 查看总对局数、黑棋胜率和白棋胜率
3. 查看胜率趋势图表

## 项目特点

1. **本地存储**: 所有数据存储在浏览器的IndexedDB中，无需后端服务
2. **SGF支持**: 支持标准SGF格式的围棋对局文件导入和解析
3. **数据可视化**: 使用Chart.js提供胜率趋势图表
4. **响应式设计**: 适配不同屏幕尺寸
5. **类型安全**: 使用TypeScript确保代码质量和开发体验

## 扩展方向

1. 增加AI分析功能
2. 添加对局复盘功能
3. 支持多用户数据同步
4. 添加更多统计图表和数据洞察
5. 实现对局评论和笔记功能