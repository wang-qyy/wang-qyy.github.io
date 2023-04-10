import { AssetType } from '@/components/TimeLine/store';
import { TrackOption } from '@/components/TimeLine/types';
import { templateTotalDurationLimit } from '@/config/basicVariable';
import { getScreenSize } from '@/utils/dom';
import Preview from './components/Preview';

// 尺标偏移距离
export const paddingLeft = 10;

// 自适应时应占总宽度的比例 废弃
export const autoRatio = 4 / 5;

// 自适应时留白距离
export const autoSpaceDistance = 100;

// 可缩放的最大值的最小值
export const maxVal = 1000;

// 可缩放的最小值
export const minVal = 20;

// 可缩放的scaleTime的最小值
export const minScaleTime = 20;

// 基础刻度宽度
export const baseScaleWidth = 15;

// 普通元素z-index从2开始 1为背景元素
export const startZIndex = 2;

// 空背景元素的type
export const emptyBgType = 'emptyBg';

// 总片段时长3分钟限制
export const partTimeLimit = templateTotalDurationLimit;

const previewRender = (asset: AssetType, active: boolean) => (
  <Preview asset={asset} active={active} />
);

export const trackTypes: TrackOption[] = [
  {
    types: ['image', 'pic', 'SVG', 'lottie', 'mask', 'background', 'svgPath'],
    height: 26,
    previewRender,
  },
  {
    types: ['text'],
    height: 26,
    previewRender,
  },
  {
    types: ['video', 'videoE'],
    height: 26,
    previewRender,
  },
  {
    types: ['module'],
    height: 26,
    previewRender,
  },
];

export const bgTrackTypes: TrackOption[] = [
  {
    types: ['video', 'videoE'],
    height: 32,
    previewRender,
  },
  {
    types: [emptyBgType],
    height: 32,
    previewRender,
  },
];

const screenSize = getScreenSize();

export const SplitPaneSize = {
  small: {
    defaultSize: 300,
    minSize: 254,
    maxSize: 429,
  },
  large: {
    defaultSize: 300,
    minSize: 254,
    maxSize: 650,
  },
}[screenSize];
