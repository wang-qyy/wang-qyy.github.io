import {
  action,
  comparer,
  computed,
  makeObservable,
  observable,
  reaction,
} from 'mobx';
import { ReactText } from 'react';

import { TimeLineData } from '@/components/TimeLine/types';
import { Camera } from '@/kernel';
import CameraState from '@/kernel/store/assetHandler/template/camera';
import {
  autoRatio,
  autoSpaceDistance,
  baseScaleWidth,
  minScaleTime,
  minVal,
  SplitPaneSize,
} from '../options';

export interface Template {
  endTime: number;
  id: ReactText;
  scale: number;
  assets: TimeLineData; // 普通元素
  bgAssets: TimeLineData; // 背景元素
  cameras: CameraState[]; // 镜头数据
  offsetTime: number; // 当前片段相对于整体的偏移时间
  width: number;
  paddingLeft: number;
  paddingRight: number;
}

class TimeLinePage {
  // 画布区域高度
  @observable canvasHeight: ReactText = SplitPaneSize.defaultSize;

  // 每个刻度表示的时间 毫秒
  @observable scaleTime = 100;

  // 每个刻度宽度
  @observable scaleWidth = baseScaleWidth;

  // 模板列表
  @observable templates: Template[] = [];

  // 模板的音频元素
  @observable audioList: TimeLineData = [];

  // 当前选中片段 -1为所有片段
  @observable activePartKey?: ReactText;

  // 尺标宽度
  @observable rulerWidth = 2000;

  // 时间轴缩放自适应值
  @observable autoScale = 200;

  // 隐藏指针
  @observable hiddenPointer = false;

  constructor() {
    makeObservable(this);

    reaction(
      () => this.activePartKey,
      () => {
        this.setAutoScale();
      },
      { equals: comparer.structural },
    );
  }

  @computed
  get timeLineScale(): number {
    return this.scaleTime / this.scaleWidth;
  }

  @computed
  get selectedTemplates(): Template[] {
    if (this.activePartKey === -1) return this.templates;
    const current = this.templates.find(t => t.id === this.activePartKey);
    if (current) return [current];
    return [];
  }

  // 当前片段时间偏移量/总时长
  @computed
  get durationInfo() {
    const offsetTime = this.selectedTemplates[0]?.offsetTime || 0;
    const countDuration = this.selectedTemplates.reduce((count, item) => {
      count += item.endTime;
      return count;
    }, 0);
    return {
      offsetTime,
      countDuration,
    };
  }

  // 所有片段总时长
  @computed
  get maxDuration() {
    return this.selectedTemplates.reduce((max, temp) => {
      max += temp.endTime;
      return max;
    }, 0);
  }

  @action
  setCanvasHeight = (height: number) => {
    this.canvasHeight = height;
  };

  @action
  setScaleTime = (scaleTime: number) => {
    console.log({ scaleTime });
    if (scaleTime < minScaleTime) {
      this.scaleTime = minScaleTime;
      this.scaleWidth =
        baseScaleWidth * (1 + (minScaleTime - scaleTime) / minScaleTime);
    } else {
      this.scaleTime = scaleTime;
      this.scaleWidth = baseScaleWidth;
    }
  };

  @action
  setScaleWidth = (scaleWidth: number) => {
    this.scaleWidth = scaleWidth;
  };

  @action
  setTemplates = (templates: Template[]) => {
    this.templates = templates;
  };

  @action
  updateTemplate = (template: Template, params: Partial<Template>) => {
    Object.assign(template, params);
  };

  @action
  setAudioList = (audioList: TimeLineData) => {
    this.audioList = audioList;
  };

  @action
  setRulerWidth = (rulerWidth: number) => {
    this.rulerWidth = rulerWidth;
  };

  @action
  setActivePartKey = (activePartKey: number) => {
    this.activePartKey = activePartKey;
  };

  @action
  setHiddenPointer = (status: boolean) => {
    this.hiddenPointer = status;
  };

  @action
  setAutoScale = () => {
    const currentAutoScale = Math.max(
      this.maxDuration /
        ((this.rulerWidth - autoSpaceDistance) / baseScaleWidth),
      minVal,
    );
    this.autoScale = currentAutoScale;
    return currentAutoScale;
  };
}

const timeLinePageStore = new TimeLinePage();

export default timeLinePageStore;
