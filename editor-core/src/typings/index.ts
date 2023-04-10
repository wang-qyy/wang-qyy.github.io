import AssetItemState from '@/kernel/store/assetHandler/asset';
import { CSSProperties } from 'react';

export interface ResAssets {
  resId: string;
  width: number;
  height: number;
  posX: number;
  posY: number;
  endTime: number;
  replaced: boolean;
  assets: AssetItemState[];
}

export interface MouseItem {
  create_date: string;
  file_type: string;
  id: string;
  init_state: string;
  preview: string;
  salves: boolean;
  title: string;
  total_time: string | number;
  update_date: string;
  url: string;
}

export interface BaseMultipleAudio {
  rt_title: string;
  resId: string;
  type: number; // bgm:1  其他配乐:2
  rt_url: string;
  // 音频出入场时间
  startTime: number;
  endTime: number;
  volume: number;
  isLoop: boolean;
  // 音频时长
  rt_duration: number;
}

// 必要替换/违规 元素
export interface WarnAssetItem {
  assId: string;
  resId: string;
  type: string; // 元素类型
  use_level: 0 | 1; // 1-需要替换元素 0-不需要
  scan_flag?: 3; // 是否违规
}

// 侧边栏菜单 元素
export interface sideBarItem {
  id: string;
  name: string;
  icon: string;
  style?: CSSProperties;
  display: number;
  isClose?: boolean;
  newFun?: boolean; // 是否是新功能
}

export interface IRgba {
  r: number;
  g: number;
  b: number;
  a: number;
}
