import { Shadow } from '@/kernel';

interface AdjustItem {
  key: keyof Shadow;
  range: [number, number];
  label: string;
}

export const adjustList: AdjustItem[] = [
  {
    key: 'x',
    range: [-100, 100],
    label: 'Offset x',
  },
  {
    key: 'y',
    range: [-100, 100],
    label: 'Offset y',
  },
  {
    key: 'blur',
    range: [0, 50],
    label: 'Blur',
  },
];
