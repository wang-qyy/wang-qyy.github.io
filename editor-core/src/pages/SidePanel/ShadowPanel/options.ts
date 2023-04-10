import { Shadow } from '@/kernel';

interface AdjustItem {
  key: keyof Shadow;
  range: [number, number];
  label: string;
}

export const defaultShadow: Shadow = {
  blur: 0,
  x: 0,
  y: 0,
  spread: 0,
  color: '#000',
};

export const adjustList: AdjustItem[] = [
  {
    key: 'x',
    range: [-100, 100],
    label: '横向偏移',
  },
  {
    key: 'y',
    range: [-100, 100],
    label: '纵向偏移',
  },
  {
    key: 'blur',
    range: [0, 50],
    label: '模糊度',
  },
];
