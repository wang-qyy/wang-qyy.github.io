import { PathItem, ShapeType } from '@/kernel';

// 贝塞尔曲线绘制圆形的控制点比率
const radio = 0.552284749831;

// 绘制椭圆形
export const generateEllipse = (width: number, height: number) => {
  // x方向圆角的控制器距离
  const XDis = (width / 2) * radio;
  // y方向圆角的控制器距离
  const YDis = (height / 2) * radio;
  return [
    {
      start: [width / 2, 0],
      startControl: [width / 2 + XDis, 0],
      endControl: [width, height / 2 - YDis],
      end: [width, height / 2],
    },
    {
      start: [width, height / 2],
      startControl: [width, height / 2 + YDis],
      endControl: [width / 2 + XDis, height],
      end: [width / 2, height],
    },
    {
      start: [width / 2, height],
      startControl: [width / 2 - XDis, height],
      endControl: [0, height / 2 + YDis],
      end: [0, height / 2],
    },
    {
      start: [0, height / 2],
      startControl: [0, height / 2 - YDis],
      endControl: [width / 2 - XDis, 0],
      end: [width / 2, 0],
    },
  ] as PathItem[];
};

// 解析矩形路径
export const generateRect = (width: number, height: number, radius: number) => {
  // 不存在圆角时
  if (!radius) {
    return [
      {
        start: [0, 0],
        end: [width, 0],
        cornerType: 'rightAngle',
      },
      {
        start: [width, 0],
        end: [width, height],
        cornerType: 'rightAngle',
      },
      {
        start: [width, height],
        end: [0, height],
        cornerType: 'rightAngle',
      },
      {
        start: [0, height],
        end: [0, 0],
        cornerType: 'rightAngle',
      },
    ] as PathItem[];
  }
  // 圆角半径 radius
  const R = Math.min(width / 2, height / 2, radius);
  // 圆角的控制器距离
  const controlDis = R * radio;
  return [
    {
      start: [R, 0],
      end: [width - R, 0],
    },
    {
      start: [width - R, 0],
      startControl: [width - R + controlDis, 0],
      endControl: [width, R - controlDis],
      end: [width, R],
    },
    {
      start: [width, R],
      end: [width, height - R],
    },
    {
      start: [width, height - R],
      startControl: [width, height - R + controlDis],
      endControl: [width - R + controlDis, height],
      end: [width - R, height],
    },
    {
      start: [width - R, height],
      end: [R, height],
    },
    {
      start: [R, height],
      startControl: [R - controlDis, height],
      endControl: [0, height - R + controlDis],
      end: [0, height - R],
    },
    {
      start: [0, height - R],
      end: [0, R],
    },
    {
      start: [0, R],
      startControl: [0, R - controlDis],
      endControl: [R - controlDis, 0],
      end: [R, 0],
    },
  ] as PathItem[];
};

// 绘制三角形
export const generateTriangle = (width: number, height: number) => {
  return [
    {
      start: [width / 2, 0],
      end: [width, height],
    },
    {
      start: [width, height],
      end: [0, height],
    },
    {
      start: [0, height],
      end: [width / 2, 0],
    },
  ] as PathItem[];
};

// 绘制线
export const generateLine = (width: number, height: number) => {
  return [
    {
      start: [0, 0],
      end: [width, height],
    },
  ] as PathItem[];
};

export const generatePath = (opts: {
  width: number;
  height: number;
  type: ShapeType;
  radius?: number;
}) => {
  const { width, height, radius = 0, type } = opts;
  switch (type) {
    case 'rect':
      return generateRect(width, height, radius);
    case 'ellipse':
      return generateEllipse(width, height);
    case 'triangle':
      return generateTriangle(width, height);
    case 'line':
      return generateLine(width, height);
    default:
      return [
        {
          start: [0, 0],
          end: [width, height],
        },
      ] as PathItem[];
  }
};

// 将 pathItem 数据拼接为svg path
export const formatToPath = (data: PathItem[], close?: boolean) => {
  return data.reduce((path, item, index) => {
    const { start, end, startControl = start, endControl = end } = item;
    const startPoint = index ? '' : `M ${start[0]} ${start[1]} `;
    const closed = data.length - 1 === index && close;
    path += `${startPoint}C ${startControl[0]} ${startControl[1]}
    ${endControl[0]} ${endControl[1]}
    ${end[0]} ${end[1]} ${closed ? 'Z' : ''}`;
    return path;
  }, '');
};
