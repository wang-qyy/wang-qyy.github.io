import { EffectInfo } from '@/kernel';

interface AdjustItem {
  key: keyof EffectInfo;
  range: [number, number]; // 该滤镜实际范围
  label: string;
}

export const adjustList: AdjustItem[] = [
  {
    key: 'contrast',
    range: [0, 200],
    label: '对比度',
  },
  {
    key: 'brightness',
    range: [0, 200],
    label: '亮度',
  },
  {
    key: 'saturate',
    range: [0, 200],
    label: '饱和度',
  },
  {
    key: 'sepia',
    range: [0, 100],
    label: '棕褐色',
  },
  {
    key: 'grayscale',
    range: [0, 100],
    label: '灰度',
  },
  {
    key: 'invert',
    range: [0, 100],
    label: '反色',
  },
  {
    key: 'hue',
    range: [0, 360],
    label: '色相',
  },
  {
    key: 'blur',
    range: [0, 20],
    label: '模糊',
  },
];
