import { remove } from 'lodash-es';
import {
  action,
  computed,
  get,
  makeObservable,
  observable,
  reaction,
  toJS,
} from 'mobx';
import { ReactText } from 'react';
import { Position, TimeLineItem, TimeLineOpts } from '../types';

export interface ZoomLimit {
  min: number;
  max: number;
}

export type trackAppender = Map<string, TargetListType>;

export interface videoClip {
  start: number;
  end: number;
}

export interface TimeLineScroller {
  width: number;
  scrollLeft: number;
}

export interface AssetType {
  source: TimeLineItem;
  tracksRange: {
    minY: number;
    midY: number;
    maxY: number;
  };
  startTime: number;
  endTime: number;
  height: number;
  trackId: string; // trackId相同时 将出现在同一条轨道上
  id: ReactText;
  fixedPosition: Position; // dom加载时候需要初始化该值
}

export interface VirtualAssetType {
  startTime: number;
  endTime: number;
  trackId: string;
  id: ReactText;
}

export interface VirtualItem {
  startTime: number;
  endTime: number;
  id: ReactText;
}

export interface TrackType {
  type?: string;
  trackId: string;
  isAddTrack?: boolean;
  // fixedPosition: Position;
  height: number;
  assets: AssetType[];
  tracksRange: {
    minY: number;
    midY: number;
    maxY: number;
  };
}

export interface AddTrackType {
  trackId: string;
  isAddTrack: true;
}

export type TargetListType = Set<AssetType>;
// todo 拖拽数据需要记录轨道信息，保证同轨元素行为一致
export type TargetList = Map<number, Set<AssetType>>;

class TimeLineStore {
  @observable options: TimeLineOpts = {
    consolidatable: false,
  };

  // 轨道列表
  @observable tracks: TrackType[] = [];

  // 虚拟元素，拖拽时候虚线表示
  @observable virtualAssets: VirtualAssetType[] = [];

  // 拉伸两端时
  @observable virtualItem: VirtualItem | undefined;

  // 当前选中的id
  @observable activeIds: ReactText[] = [];

  // 是否处于拖拽状态
  @observable inDragging = false;

  // 轨道缩放比例
  @observable scale = 1;

  // 时间轴总时长，时间轴宽度也根据该值计算
  @observable duration = 0;

  // TODO: 为了解决在拖动元素时候容器滚动导致匹配轨道异常，当有多个滚动容器时仍可能会有问题
  // 距离顶部偏移距离，一般为外部 scroll 容器的 scrollTop
  @observable scroll: Position = {
    left: 0,
    top: 0,
  };

  // 对齐线
  @observable alignLines: number[] = [];

  constructor() {
    makeObservable(this);
  }

  @action
  initTracks = (tracks: TrackType[]) => {
    this.tracks = tracks;
  };

  @action
  initOptions = (options: TimeLineOpts) => {
    Object.assign(this.options, options);
  };

  @action
  addActiveId = (activeId: string) => {
    this.activeIds.push(activeId);
  };

  @action
  replaceActiveIds = (activeIds: ReactText[]) => {
    this.activeIds = activeIds;
  };

  // 添加或更新virtualAsset
  @action
  putVirtualAsset = (virtualAsset: VirtualAssetType) => {
    const current = this.virtualAssets.find(t => t.id === virtualAsset.id);
    if (current) {
      Object.assign(current, virtualAsset);
      return current;
    }
    this.virtualAssets.push(virtualAsset);
    return this.virtualAssets[this.virtualAssets.length - 1];
  };

  @action
  replaceVirtualAssets = (virtualAssets: VirtualAssetType[]) => {
    this.virtualAssets = virtualAssets;
  };

  @action
  removeVirtualAsset = (id: ReactText) => {
    const index = this.virtualAssets.findIndex(t => t.id === id);
    if (index === -1) return;
    this.virtualAssets.splice(index, 1);
  };

  @action
  clearActiveIds = () => {
    this.activeIds = [];
  };

  @action
  updateAsset = (asset: AssetType, params: Partial<AssetType>) => {
    Object.assign(asset, params);
  };

  @action
  updateTrack = (track: TrackType, params: Partial<TrackType>) => {
    Object.assign(track, params);
  };

  @action
  setInDragging = (status: boolean) => {
    this.inDragging = status;
  };

  @action
  setScroll = (scroll: Partial<Position>) => {
    Object.assign(this.scroll, scroll);
  };

  @action
  setDuration = (duration: number) => {
    this.duration = duration;
  };

  @action
  setScale = (scale: number) => {
    this.scale = scale;
  };

  @action
  setVirtualItem = (virtualItem?: VirtualItem) => {
    this.virtualItem = virtualItem;
  };

  @action
  setAlignLines = (alignLines: number[]) => {
    this.alignLines = alignLines;
  };

  @computed
  get assetsMap() {
    const assetsMap: AssetType[] = [];
    this.tracks.forEach(track => {
      track.assets.forEach(asset => assetsMap.push(asset));
    });
    return assetsMap;
  }

  getAsset = (id: ReactText) => {
    return this.assetsMap.find(asset => asset.id === id);
  };
}

// const timeLineStore = new TimeLineStore();

export default TimeLineStore;
