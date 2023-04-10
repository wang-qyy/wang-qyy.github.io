import { Filters } from '@/kernel';

interface AdjustItem {
  key: keyof Filters;
  range: [number, number]; // 该滤镜实际范围
  sliderRange: [number, number]; // slider区间值 [min, max]
  label: string;
}

export const adjustList: AdjustItem[] = [
  {
    key: 'blur',
    range: [0, 1],
    sliderRange: [0, 100],
    label: '模糊',
  },
  {
    key: 'brightness',
    range: [-1, 1],
    sliderRange: [-50, 50],
    label: '亮度',
  },
  {
    key: 'contrast',
    range: [-1, 1],
    sliderRange: [-50, 50],
    label: '对比度',
  },
  {
    key: 'gamma-r',
    range: [0.01, 1.99],
    sliderRange: [-50, 50],
    label: '偏色',
  },
  {
    key: 'gamma-g',
    range: [0.01, 1.99],
    sliderRange: [-50, 50],
    label: '色调',
  },
  {
    key: 'gamma-b',
    range: [0.01, 1.99],
    sliderRange: [-50, 50],
    label: '温度',
  },
  {
    key: 'hue',
    range: [-2, 2],
    sliderRange: [-50, 50],
    label: '色相',
  },
  {
    key: 'saturate',
    range: [-1, 1],
    sliderRange: [-50, 50],
    label: '饱和度',
  },
  {
    key: 'sharpen',
    range: [0, 2],
    sliderRange: [0, 100],
    label: '锐化',
  },
  {
    key: 'strong',
    range: [0, 1],
    sliderRange: [0, 100],
    label: '强度',
  },
  // {
  //   key: 'grayscale',
  //   range: [0, 1],
  //   sliderRange: [0, 100],
  //   label: '灰度',
  // },
  // {
  //   key: 'noise',
  //   range: [0, 1000],
  //   sliderRange: [0, 100],
  //   label: '杂质',
  // },
];
