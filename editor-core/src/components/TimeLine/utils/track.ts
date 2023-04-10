import randomString from 'crypto-random-string';
import { ReactText } from 'react';
import { TimeLineData, TimeLineItem, TimeLineOpts } from '../types';
import TimeLineStore, { AssetType, TrackType } from '../store';
import { appendTrackHeight, defaultTrackOption } from '../constants';

export const createId = () => randomString({ length: 6 });

/**
 * @description 将时间转换为像素 timeLineStore: TimeLineStore
 * @param time 毫秒
 */
export function calcTimeToPx(time: number, scale: number) {
  return time / scale;
}

/**
 * @description 将像素转换为时间
 * @param time 毫秒
 */
export function calcPxToTime(distance: number, scale: number) {
  return distance * scale;
}

export function structureTrack(
  options: TimeLineOpts,
  asset: TimeLineItem,
  countHeight: number,
) {
  const { type, trackId } = asset;
  const { trackTypes = [] } = options;
  const current = trackTypes.find(t => t.types.includes(type || ''));
  const trackOption = current || defaultTrackOption;

  const data: TrackType = {
    trackId: trackId || createId(),
    type,
    height: trackOption.height,
    tracksRange: {
      minY: countHeight,
      midY: countHeight + trackOption.height / 2,
      maxY: countHeight + trackOption.height,
    },
    assets: [],
  };

  return data;
}

// 添加空轨道
export function structureAppendTrack(countHeight: number) {
  const data: TrackType = {
    trackId: createId(),
    isAddTrack: true,
    tracksRange: {
      minY: countHeight,
      midY: countHeight + appendTrackHeight / 2,
      maxY: countHeight + appendTrackHeight,
    },
    height: appendTrackHeight,
    assets: [],
  };

  return data;
}

// 构建asset
const structureAsset = (
  item: TimeLineItem,
  trackData: TrackType,
  timeLineStore: TimeLineStore,
) => {
  const cacheAsset = timeLineStore.getAsset(item.id);
  const asset: AssetType = {
    source: item,
    height: trackData.height,
    trackId: trackData.trackId,
    id: item.id,
    startTime: item.startTime,
    endTime: item.endTime,
    fixedPosition: {
      top: 0,
      left: 0,
    },
    tracksRange: { ...trackData.tracksRange },
  };
  if (cacheAsset) {
    timeLineStore.updateAsset(cacheAsset, asset);
    return cacheAsset;
  }
  return asset;
};

/**
 * @description 将传入的数据配置 format 成时间轴数据
 * @param {TimeLineData} data
 * @param {TimeLineOpts} options
 * @returns {TrackType[]}
 */
export const format2Tracks = (
  data: TimeLineData,
  options: TimeLineOpts,
  timeLineStore: TimeLineStore,
) => {
  const tracks: TrackType[] = [];
  // 计算当前轨道高度
  let countHeight = 0;

  data.forEach(item => {
    const { trackId } = item;

    // 查找当前的trackId是否存在
    let trackData = tracks.find(t => t.trackId === trackId);
    if (!trackData) {
      tracks.push(structureAppendTrack(countHeight));
      countHeight += appendTrackHeight;

      trackData = structureTrack(options, item, countHeight);
      countHeight += trackData.height;

      tracks.push(trackData);
    }
    const assetData = structureAsset(item, trackData, timeLineStore);
    trackData.assets.push(assetData);
  });
  tracks.push(structureAppendTrack(countHeight));

  return tracks;
};

// 点击位置是否是 asset 元素
export const isDraggableNode = (event: MouseEvent) => {
  // @ts-ignore
  const path = event.path || (event.composedPath && event.composedPath()) || [];
  return path.some((pathElement: HTMLElement) => {
    return pathElement?.className === 'timeLine-asset';
  });
};
