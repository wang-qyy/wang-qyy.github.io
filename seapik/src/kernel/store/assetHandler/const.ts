import { TemplateVideoInfo } from '@/kernel';

export const DEFAULT_BACKGROUND = {
  backgroundColor: { r: 255, g: 255, b: 255, a: 1 },
  backgroundImage: {
    resId: '',
    rt_imageUrl: '',
    backgroundSize: {
      width: 0,
      height: 0,
    },
  },
};
export const DEFAULT_VIDEO_INFO: TemplateVideoInfo = {
  startTime: 0,
  endTime: 0,
  allAnimationTime: 0,
  pageTime: 0,
  baseTime: 0,
  offsetTime: [0, 0],
  allAnimationTimeBySpeed: 0,
};

export const DEFAULT_FONT_FAMILY = '';
