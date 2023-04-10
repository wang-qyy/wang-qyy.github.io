import { clamp } from 'lodash-es';

import TimeLineStore, {
  AssetType,
  TrackType,
  VirtualAssetType,
} from '../store';
import { defaultMinDuration } from '../constants';
import { ChangeType, Position } from '../types';
import { calcPxToTime, calcTimeToPx } from './track';
import { DragItemHandlerInfo } from './mouseHandler';

interface Ctx {
  accurateTrack?: TrackType;
  position: Position;
  changedPosition: Position;
  asset: AssetType;
  initialScroll: Position;
  virtualAsset?: VirtualAssetType;
  updater: Partial<VirtualAssetType>;
  timeLineStore: TimeLineStore;
  scale: number;
}

/**
 * @description 根据鼠标移动的距离，计算对齐线位置, 并吸附至第一条对齐线位置
 * @param points 每个点的位置
 * @param asset 元素对象
 * @returns points中每个点对应的对齐线位置
 */

export const calcAlignLines = (opts: {
  startPoint?: number;
  endPoint?: number;
  asset: AssetType;
  timeLineStore: TimeLineStore;
}) => {
  const { startPoint, endPoint, asset, timeLineStore } = opts;
  const {
    tracks,
    options: { adsorbLimit },
    duration,
  } = timeLineStore;

  const points = [startPoint, endPoint].filter(
    t => t !== undefined,
  ) as number[];

  const lines: (number | undefined)[] = new Array(points.length).fill(
    undefined,
  );

  // adsorbLimit 为0或不存在 则不计算吸附
  if (!adsorbLimit) return lines;

  points.forEach((point, index) => {
    // 左边边界
    if (startPoint && Math.abs(0 - point) <= adsorbLimit) {
      lines[index] = 0;
      return true;
    }
    // 右边边界
    if (endPoint && duration && Math.abs(duration - point) <= adsorbLimit) {
      lines[index] = duration;
      return true;
    }
    tracks.find(track => {
      return track.assets.find(item => {
        const { startTime, endTime } = item;
        if (item.id === asset.id) return false;
        if (Math.abs(startTime - point) <= adsorbLimit) {
          lines[index] = startTime;
          return true;
        }
        if (Math.abs(endTime - point) <= adsorbLimit) {
          lines[index] = endTime;
          return true;
        }
        return false;
      });
    });
  });

  return lines;
};

// 匹配命中的轨道
const matchAccurateTrack = (ctx: Ctx) => {
  const { asset, position, timeLineStore } = ctx;
  const { tracks } = timeLineStore;

  const currentY = asset.tracksRange.midY + position.top;

  const accurate = tracks.find((track, index) => {
    const { tracksRange } = track;
    if (index === 0) return currentY <= tracksRange.maxY;
    if (index === tracks.length - 1) return currentY > tracksRange.minY;
    return currentY > tracksRange.minY && currentY <= tracksRange.maxY;
  });

  return accurate;
};

// 构建virtualAsset
export const structureVirtualAsset = (asset: AssetType, trackId: string) => {
  const newAsset = {
    id: asset.id,
    trackId,
    startTime: asset.source.startTime,
    endTime: asset.source.endTime,
  };
  return newAsset;
};

// 检测当前命中的轨道是否存在时间冲突
const calcTimeChange = (ctx: Ctx) => {
  const {
    accurateTrack,
    asset,
    position,
    updater,
    scale,
    timeLineStore: { duration: maxDuration },
  } = ctx;
  const { startTime, endTime } = asset.source;
  const variableTime = calcPxToTime(position.left, scale);
  const duration = endTime - startTime;

  const data: Partial<VirtualAssetType> = {
    startTime: startTime + variableTime,
    endTime: endTime + variableTime,
  };

  // 右边最大限制
  if (maxDuration && data.endTime! > maxDuration) {
    data.endTime = maxDuration;
    data.startTime = data.endTime - duration;
  }

  // 左边边最小限制 暂定未0 有需求再改为配置
  if (data.startTime! < 0) {
    data.startTime = 0;
    data.endTime = 0 + duration;
  }

  // 检测当前命中的轨道是否存在时间冲突
  if (
    accurateTrack!.assets.some(t => {
      if (t.id === asset.id) return false;
      return !(
        data.endTime! <= t.source.startTime ||
        data.startTime! >= t.source.endTime
      );
    })
  )
    return true;
  Object.assign(updater, data);
  updater.trackId = accurateTrack?.trackId;
};

// 设置拖动时对齐线以及自动吸附
const setMovingAlignLines = (ctx: Ctx) => {
  const { initialScroll, timeLineStore, changedPosition, asset, scale } = ctx;
  const { startTime, endTime } = asset;
  const { scroll, setAlignLines } = timeLineStore;
  const { left: initialLeft } = initialScroll;
  // 移动期间容器可能会滚动
  const offsetLeft = scroll.left - initialLeft;
  // 当前实际移动的的left
  const changedLeft = changedPosition.left + offsetLeft;
  // 当前位置实际的时间
  const changedTime = calcPxToTime(changedLeft, scale);

  const alignLines = calcAlignLines({
    startPoint: changedTime + startTime,
    endPoint: changedTime + endTime,
    asset,
    timeLineStore,
  });

  const lines = alignLines.filter(t => t !== undefined) as number[];
  setAlignLines(lines);

  if (!lines.length) return;

  const firstLine = lines[0];
  // 吸附的时间差
  let adsorbTime = firstLine - (changedTime + startTime);

  // 如果吸附的是结束时间
  if (alignLines[0] === undefined) {
    adsorbTime = firstLine - (changedTime + endTime);
  }
  // 吸附的距离差
  const adsorbDistance = calcTimeToPx(adsorbTime, scale);
  ctx.changedPosition.left += adsorbDistance;
  ctx.position.left += adsorbDistance;
};

// 当元素拖拽时事件
export const onDragAsset = (
  asset: AssetType,
  currentPosition: Position,
  initialScroll: Position,
  info: DragItemHandlerInfo,
  timeLineStore: TimeLineStore,
) => {
  const { updateAsset, putVirtualAsset, removeVirtualAsset, scroll, scale } =
    timeLineStore;

  const { left: initialLeft, top: initialTop } = initialScroll;

  // 移动期间容器可能会滚动
  const offsetLeft = scroll.left - initialLeft;
  const offsetTop = scroll.top - initialTop;

  const { distanceX: left, distanceY: top } = info;

  const ctx: Ctx = {
    asset,
    changedPosition: {
      left,
      top,
    },
    position: {
      left: left + offsetLeft,
      top: top + offsetTop,
    },
    timeLineStore,
    initialScroll,
    updater: {
      id: asset.id,
    },
    scale,
  };

  // 设置对齐线以及自动吸附
  setMovingAlignLines(ctx);

  // 更新 fixedPosition 位置
  updateAsset(asset, {
    fixedPosition: {
      left: currentPosition.left + ctx.changedPosition.left,
      top: currentPosition.top + ctx.changedPosition.top,
    },
  });

  // 检测当前位置是否有命中的轨道
  const accurateTrack = matchAccurateTrack(ctx);
  if (!accurateTrack) {
    // 如果没有命中 则清除 virtualAsset
    removeVirtualAsset(asset.id);
    return;
  }

  ctx.accurateTrack = accurateTrack;

  // 检测时间碰撞
  const conflicted = calcTimeChange(ctx);

  if (conflicted) return;

  // 添加或更新virtualAsset
  putVirtualAsset(ctx.updater as VirtualAssetType);
};

// 拖拽结束
export const onDragEnd = (
  asset: AssetType,
  timeLineStore: TimeLineStore,
  info: DragItemHandlerInfo,
) => {
  const { id } = asset;
  const {
    virtualAssets,
    replaceVirtualAssets,
    tracks,
    setInDragging,
    options: { onTrackChange = () => {}, onTimeChangeEnd = () => {} },
    setAlignLines,
  } = timeLineStore;

  // 清空辅助线
  setAlignLines([]);

  const virtualAsset = virtualAssets.find(t => t.id === id);

  // 没有虚拟元素则没有发生变化
  if (virtualAsset) {
    // 更新排序
    if (virtualAsset.trackId !== asset.trackId) {
      let index = 0;

      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        // 当前命中的轨道
        if (track.trackId === virtualAsset.trackId) {
          if (track.isAddTrack) break;

          // 当前命中的轨道前面有几个asset
          const aheadLength = track.assets.filter(
            t => t.source.endTime < virtualAsset.startTime && t.id !== asset.id,
          ).length;
          index += aheadLength;
          break;
        }
        // 非未命中轨道
        if (!track.isAddTrack)
          index += track.assets.filter(t => t.id !== asset.id).length;
      }

      onTrackChange({
        id,
        fromTrackId: asset.trackId,
        trackId: virtualAsset.trackId,
        index,
        record: asset.source,
      });
    }

    // 时间有变化则更新时间，这里要保证先更新排序，再更新时间
    if (
      virtualAsset.startTime !== asset.source.startTime ||
      virtualAsset.endTime !== asset.source.endTime
    ) {
      onTimeChangeEnd({
        id,
        startTime: virtualAsset.startTime,
        endTime: virtualAsset.endTime,
        changeType: 'move',
        record: asset.source,
        event: info.event,
      });
    }
  }
  replaceVirtualAssets([]);
  setInDragging(false);
};

// 获取当前元素的上一个或者下一个元素
export const getAdjacentAsset = (
  store: TimeLineStore,
  asset: AssetType,
  type: 'prev' | 'next',
): AssetType | undefined => {
  const { tracks } = store;
  const track = tracks.find(t => t.trackId === asset.trackId);
  if (!track) return;
  const index = track.assets.findIndex(t => t.id === asset.id);
  return track.assets[index - (type === 'next' ? -1 : 1)];
};

// 当元素拖动左边手柄
export const onDragLeft = (
  asset: AssetType,
  info: DragItemHandlerInfo,
  timeLineStore: TimeLineStore,
) => {
  const { distanceX: left, event } = info;
  const { updateAsset, options, setAlignLines, scale } = timeLineStore;
  const { onTimeChange = () => {} } = options;
  const { source } = asset;
  const {
    startTime,
    endTime,
    id,
    minDuration = defaultMinDuration,
    minStartTime = 0,
  } = source;
  const variationalTime = calcPxToTime(left, scale);

  let newStartTime = startTime + variationalTime;

  // 获取上一个相邻元素
  const prevAsset = getAdjacentAsset(timeLineStore, asset, 'prev');
  const prevEndTime = Math.max(
    prevAsset?.source.endTime || minStartTime || 0,
    minStartTime,
  );

  // 最大最小时间限制
  const limit = [prevEndTime, endTime - minDuration];

  // 获取当前位置的对齐线
  const alignLines = calcAlignLines({
    startPoint: startTime + variationalTime,
    asset,
    timeLineStore,
  }).filter(t => t !== undefined && t >= limit[0] && t <= limit[1]) as number[];

  setAlignLines(alignLines);

  // 如果存在对齐线 则吸附至第一条对齐线位置
  if (alignLines[0] !== undefined) newStartTime = alignLines[0] + 0;

  // 开始时间不能超过上一个元素的endTime 且总时长不能小于最小时长
  newStartTime = clamp(newStartTime, limit[0], limit[1]);

  updateAsset(asset, {
    startTime: newStartTime,
  });

  if (newStartTime === startTime) return;
  onTimeChange({
    id,
    startTime: newStartTime,
    endTime,
    changeType: 'start',
    record: source,
    event,
  });
};

// 当元素拖动右边手柄
export const onDragRight = (
  asset: AssetType,
  info: DragItemHandlerInfo,
  timeLineStore: TimeLineStore,
) => {
  const { distanceX: left, event } = info;
  const { updateAsset, options, setAlignLines, scale } = timeLineStore;
  const { onTimeChange = () => {} } = options;
  const { source } = asset;
  const {
    startTime,
    endTime,
    id,
    maxEndTime = Infinity,
    minDuration = defaultMinDuration,
  } = source;
  const variationalTime = calcPxToTime(left, scale);

  let newEndTime = endTime + variationalTime;

  // 获取下一个相邻元素
  const nextAsset = getAdjacentAsset(timeLineStore, asset, 'next');
  const maxLimit = Math.min(
    nextAsset?.source.startTime || Infinity,
    maxEndTime,
  );

  // 最大最小时间限制
  const limit = [startTime + minDuration, maxLimit];

  // 获取当前位置的对齐线
  const alignLines = calcAlignLines({
    endPoint: newEndTime,
    asset,
    timeLineStore,
  }).filter(t => t !== undefined && t >= limit[0] && t <= limit[1]) as number[];

  setAlignLines(alignLines);

  // 如果存在对齐线 则吸附至第一条对齐线位置
  if (alignLines[0] !== undefined) newEndTime = alignLines[0] + 0;

  // 结束时间不能超过最大限制时间 且总时长不能小于最小时长
  newEndTime = clamp(newEndTime, limit[0], limit[1]);

  const newAsset = timeLineStore.getAsset(asset.id);
  if (newAsset) {
    updateAsset(newAsset, {
      endTime: newEndTime,
    });
  }

  if (newEndTime === endTime) return;

  onTimeChange({
    id,
    startTime,
    endTime: newEndTime,
    changeType: 'end',
    record: source,
    event,
  });
};

// 拖动左边手柄鼠标抬起
export const onDragTimeEnd = (
  asset: AssetType,
  timeLineStore: TimeLineStore,
  changeType: ChangeType,
  info: DragItemHandlerInfo,
) => {
  const { source, startTime, endTime, id } = asset;
  const {
    options: { onTimeChangeEnd = () => {} },
    setAlignLines,
  } = timeLineStore;

  // 清空辅助线
  setAlignLines([]);

  onTimeChangeEnd({
    id,
    startTime,
    endTime,
    changeType,
    record: source,
    event: info.event,
  });
};
