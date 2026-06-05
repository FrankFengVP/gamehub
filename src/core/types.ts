import type { ComponentType } from 'react';

/** 单个游戏的元数据与入口组件 */
export interface GameDefinition {
  /** 唯一标识，用于路由 path */
  id: string;
  /** 展示名称 */
  title: string;
  /** 简短描述 */
  description: string;
  /** 卡片标签，如 "3D" / "益智" */
  tags: string[];
  /** 缩略图渐变色 [from, to] */
  accent: [string, string];
  /** 游戏页面组件 */
  component: ComponentType;
}
