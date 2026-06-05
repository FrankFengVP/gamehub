# GameHub — 前端游戏合集

基于 React + Vite 的浏览器游戏大厅，采用**游戏注册表**架构，便于后续追加新游戏。

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开终端提示的本地地址（默认 `http://localhost:5173`）。

## 已收录游戏

| ID | 名称 | 说明 |
|----|------|------|
| `imitation3d` | 3D 模仿记忆 | 观察四色方块闪烁顺序并复现，序列逐关变长 |

## 新增游戏（3 步）

1. 在 `src/games/<your-game-id>/` 创建游戏组件与 `index.ts`，导出符合 `GameDefinition` 的配置：

```ts
import type { GameDefinition } from '@/core/types';
import { YourGame } from './YourGame';

export const yourGame: GameDefinition = {
  id: 'your-game-id',
  title: '游戏标题',
  description: '简短描述',
  tags: ['标签'],
  accent: ['#起始色', '#结束色'],
  component: YourGame,
};
```

2. 在 `src/core/registry.ts` 中 import 并加入 `games` 数组。

3. 完成。首页卡片与路由 `/play/your-game-id` 会自动生效。

## 项目结构

```
src/
  core/           # 类型与注册表
  components/     # 布局、大厅、游戏壳
  games/          # 各游戏独立目录
    imitation3d/
  styles/
```

## 构建

```bash
npm run build
npm run preview
```

本地预览 GitHub Pages 构建产物：

```bash
npm run build:gh-pages
npm run preview
```

浏览器访问 `http://localhost:4173/gamehub/`。

## 部署到 GitHub Pages

推送 `main` 分支后，GitHub Actions 会自动构建并发布到 Pages。

首次使用前，在仓库 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。

站点地址：`https://<用户名>.github.io/gamehub/`
