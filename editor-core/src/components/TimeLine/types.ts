import { ReactText } from 'react';
import { AssetType } from './store';

export interface TimeLineItem {
  startTime: number;
  endTime: number;
  trackId: string;
  maxEndTime?: number; // 最大 endTime 限制
  minStartTime?: number; // 最小 startTime 限制
  minDuration?: number; // 最小时长限制
  type?: string;
  id: ReactText;
  disableDrag?: boolean;
  [key: string]: any;
}

export type ChangeType = 'start' | 'end' | 'move';

export interface TimeChangeInfo {
  id: ReactText;
  startTime: number; // 变化后的startTime
  endTime: number; // 变化后的endTime
  changeType: ChangeType;
  record: TimeLineItem; // 原数据
  event: MouseEvent;
}

export interface TrackChangeInfo {
  id: ReactText;
  fromTrackId: string;
  trackId: string;
  index: number; // 变化后的index
  record: TimeLineItem; // 原数据
}

export interface MouseInfo {
  id: ReactText;
  changeType: ChangeType;
  record: TimeLineItem; // 原数据
  event: MouseEvent;
}

export interface TrackOption {
  types: string[];
  height: number;
  previewRender?: (asset: AssetType, active: boolean) => JSX.Element; // 预览
}

export interface TimeLineOpts {
  // minTime?: number; // 可拖拽的最小值 毫秒
  // maxTime?: number; // 可拖拽的最大值 毫秒
  // scale: number; // 1px 表示的时长 毫秒
  consolidatable?: boolean; // 是否可以共轨
  adsorbLimit?: number; // 自动吸附距离
  onMouseDown?: (info: MouseInfo) => void;
  onMouseMove?: (info: MouseInfo) => void;
  onMouseUp?: (info: MouseInfo) => void;
  onTimeChange?: (info: TimeChangeInfo) => void;
  onTimeChangeEnd?: (info: TimeChangeInfo) => void;
  onTrackChange?: (info: TrackChangeInfo) => void;
  trackTypes?: TrackOption[];
}

export type TimeLineData = TimeLineItem[];

export interface Position {
  left: number;
  top: number;
}

// export type DragItemHandlerFC = (
//   position: Position,
//   mousePosition: Position,
// ) => void;

export interface GlobalProps {
  scaleTime: number;
  scaleWidth: number;
  paddingLeft: number;
  // scroll: Position;
}

// export interface GlobalContextType {
//   scaleTime: number; // 每个刻度表示的时间
//   scaleWidth: number; // 每个刻度宽度
//   paddingLeft: number;
//   scale: number;
// }
