import { ShapeType } from '@/kernel';

// 'rect' | 'ellipse' | 'path';
export const shapeList: {
  type: ShapeType;
  name: string;
  icon: string;
}[] = [
  {
    type: 'rect',
    name: '矩形',
    icon: 'juxing',
  },
  {
    type: 'ellipse',
    name: '圆形',
    icon: 'yuanxing',
  },
  {
    type: 'triangle',
    name: '三角形',
    icon: 'sanjiaoxing',
  },
  {
    type: 'line',
    name: '直线',
    icon: 'zhixian',
  },
];
