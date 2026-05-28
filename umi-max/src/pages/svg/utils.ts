// types.ts
export type GradientColorType = 'linear' | 'radial';
export type GradientUnits = 'userSpaceOnUse' | 'objectBoundingBox';

export interface ColorStop {
  id: string;
  offset: number; // 0-1
  color: string; // 十六进制颜色
  opacity?: number; // 0-1
}

export interface Coords {
  x1?: number; // 0-1
  y1?: number; // 0-1
  x2?: number; // 0-1
  y2?: number; // 0-1
  cx?: number; // 0-1
  cy?: number; // 0-1
  r?: number; // 0-1
  fx?: number; // 0-1
  fy?: number; // 0-1
}

export interface GradientColor {
  id?: string;
  type: GradientColorType;
  angle?: number; // 角度，0-360
  colorStops: ColorStop[];
  coords: Coords;
  gradientUnits?: GradientUnits;
  // 2D仿射变换矩阵[a, b, c, d, e, f]
  gradientTransform?: [number, number, number, number, number, number];
}

/**
 * 构建SVG渐变定义
 */
export function buildSVGGradient(gradient: GradientColor): string {
  if (!gradient.id) {
    throw new Error('渐变ID不能为空');
  }

  if (!gradient.colorStops || gradient.colorStops.length < 2) {
    throw new Error('至少需要两个颜色控制点');
  }

  validateColorStops(gradient.colorStops);
  validateCoords(gradient.coords, gradient.type);

  if (gradient.type === 'linear') {
    return buildLinearGradient(gradient);
  } else {
    return buildRadialGradient(gradient);
  }
}

/**
 * 构建线性渐变
 */
function buildLinearGradient(gradient: GradientColor): string {
  const { id, coords, colorStops, gradientUnits, gradientTransform, angle } = gradient;

  // 如果提供了角度，计算坐标
  const finalCoords = angle !== undefined
    ? calculateLinearCoordsByAngle(angle, coords)
    : coords;

  const attributes: string[] = [
    `id="${id}"`,
    `x1="${toPercentage(finalCoords.x1 || 0)}"`,
    `y1="${toPercentage(finalCoords.y1 || 0)}"`,
    `x2="${toPercentage(finalCoords.x2 || 1)}"`,
    `y2="${toPercentage(finalCoords.y2 || 0)}"`,
  ];

  if (gradientUnits) {
    attributes.push(`gradientUnits="${gradientUnits}"`);
  }

  if (gradientTransform) {
    const transform = `matrix(${gradientTransform.join(' ')})`;
    attributes.push(`gradientTransform="${transform}"`);
  }

  const stopElements = colorStops.map(buildColorStop).join('\n    ');

  return `<linearGradient ${attributes.join(' ')}>
    ${stopElements}
  </linearGradient>`;
}

/**
 * 构建径向渐变
 */
function buildRadialGradient(gradient: GradientColor): string {
  const { id, coords, colorStops, gradientUnits, gradientTransform } = gradient;

  const attributes: string[] = [
    `id="${id}"`,
  ];

  // 添加坐标属性
  if (coords.cx !== undefined) attributes.push(`cx="${toPercentage(coords.cx)}"`);
  if (coords.cy !== undefined) attributes.push(`cy="${toPercentage(coords.cy)}"`);
  if (coords.r !== undefined) attributes.push(`r="${toPercentage(coords.r)}"`);
  if (coords.fx !== undefined) attributes.push(`fx="${toPercentage(coords.fx)}"`);
  if (coords.fy !== undefined) attributes.push(`fy="${toPercentage(coords.fy)}"`);

  // 设置默认值
  if (coords.cx === undefined) attributes.push('cx="50%"');
  if (coords.cy === undefined) attributes.push('cy="50%"');
  if (coords.r === undefined) attributes.push('r="50%"');

  if (gradientUnits) {
    attributes.push(`gradientUnits="${gradientUnits}"`);
  }

  if (gradientTransform) {
    const transform = `matrix(${gradientTransform.join(' ')})`;
    attributes.push(`gradientTransform="${transform}"`);
  }

  const stopElements = colorStops.map(buildColorStop).join('\n    ');

  return `<radialGradient ${attributes.join(' ')}>
    ${stopElements}
  </radialGradient>`;
}

/**
 * 根据角度计算线性渐变坐标
 */
export function calculateLinearCoordsByAngle(angle: number, baseCoords?: Coords): Coords {
  const radians = (angle * Math.PI) / 180;

  // 默认从中心点开始
  const x1 = baseCoords?.x1 ?? 0.5;
  const y1 = baseCoords?.y1 ?? 0.5;

  // 计算终点坐标
  const length = Math.sqrt(2); // 对角线长度
  const x2 = x1 + Math.cos(radians) * length;
  const y2 = y1 + Math.sin(radians) * length;

  return {
    x1: clamp01(x1),
    y1: clamp01(y1),
    x2: clamp01(x2),
    y2: clamp01(y2),
  };
}

/**
 * 构建颜色控制点
 */
function buildColorStop(stop: ColorStop): string {
  const attributes: string[] = [
    `offset="${toPercentage(stop.offset)}"`,
    `stop-color="${typeof stop.color === 'string' ? stop.color : `rgba(${stop.color.r},${stop.color.g},${stop.color.b},1)`}"`,
  ];

  if (stop.opacity !== undefined && stop.opacity !== 1) {
    attributes.push(`stop-opacity="${stop.opacity}"`);
  }

  return `<stop ${attributes.join(' ')} />`;
}

/**
 * 数值转换为百分比字符串
 */
function toPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

/**
 * 限制数值在0-1之间
 */
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * 验证颜色控制点
 */
function validateColorStops(stops: ColorStop[]): void {
  stops.forEach((stop, index) => {
    if (stop.offset < 0 || stop.offset > 1) {
      throw new Error(`颜色控制点 ${index} 的offset必须在0-1之间`);
    }

    if (!isValidColor(stop.color)) {
      throw new Error(`颜色控制点 ${index} 的颜色格式无效: ${stop.color}`);
    }

    if (stop.opacity !== undefined && (stop.opacity < 0 || stop.opacity > 1)) {
      throw new Error(`颜色控制点 ${index} 的opacity必须在0-1之间`);
    }
  });

  // 检查offset是否按顺序排列
  const sortedOffsets = [...stops].sort((a, b) => a.offset - b.offset);
  if (JSON.stringify(stops) !== JSON.stringify(sortedOffsets)) {
    console.warn('颜色控制点的offset没有按顺序排列，将自动排序');
  }
}

/**
 * 验证坐标
 */
function validateCoords(coords: Coords, type: GradientColorType): void {
  if (type === 'linear') {
    const coordsKeys = ['x1', 'y1', 'x2', 'y2'];
    coordsKeys.forEach(key => {
      const val = coords[key as keyof Coords];
      if (typeof val !=='number'|| (val < 0 || val > 1)) {
        throw new Error(`${key}必须在0-1之间`);
      }
    });

  } else {
    ['cx', 'cy', 'r', 'fx', 'fy'].forEach(prop => {
      const val = coords[prop as keyof Coords];

      if (typeof val !=='number'|| (val < 0 || val > 1)) {
        throw new Error(`${prop}必须在0-1之间`);
      }
    });

    // 半径必须为正数
    if (coords.r !== undefined && coords.r <= 0) {
      throw new Error('r必须大于0');
    }
  }
}

/**
 * 验证颜色格式
 */
function isValidColor(color: string): boolean {
  // 检查十六进制颜色
  const hexRegex = /^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i;
  if (hexRegex.test(color)) {
    return true;
  }

  // 检查颜色名称
  const colorNames = [
    'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
    'black', 'white', 'gray', 'grey', 'transparent'
  ];
  if (colorNames.includes(color.toLowerCase())) {
    return true;
  }

  // 检查rgb/rgba
  const rgbRegex = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)$/i;
  if (rgbRegex.test(color)) {
    return true;
  }

  return false;
}



/********************************/

/**
 * 创建完整的SVG元素
 */
export function createSVGWithGradient(options: {
  width: number;
  height: number;
  gradients: GradientColor[];
  shapes?: Array<{
    type: 'rect' | 'circle' | 'ellipse' | 'path' | 'polygon' | 'polyline';
    attributes: Record<string, string | number>;
    fill: string; // 渐变ID或颜色
  }>;
  viewBox?: string;
  preserveAspectRatio?: string;
}): string {
  const {
    width,
    height,
    gradients,
    shapes = [],
    viewBox = `0 0 ${width} ${height}`,
    preserveAspectRatio = 'xMidYMid meet'
  } = options;

  // 构建渐变定义
  const gradientDefs = gradients.map(gradient =>
    buildSVGGradient(gradient)
  ).join('\n    ');

  // 构建形状
  const shapeElements = shapes.map(shape =>
    createShapeElement(shape.type, shape.attributes, shape.fill)
  ).join('\n    ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg 
  width="${width}" 
  height="${height}" 
  viewBox="${viewBox}"
  preserveAspectRatio="${preserveAspectRatio}"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
>
  <defs>
    ${gradientDefs}
  </defs>
  ${shapeElements}
</svg>`;
}

/**
 * 创建形状元素
 */
function createShapeElement(
  type: string,
  attributes: Record<string, string | number>,
  fill: string
): string {
  const attrs = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  return `<${type} ${attrs} fill="${fill}" />`;
}

/**
 * 生成渐变ID
 */
export function generateGradientId(prefix = 'gradient'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 创建预设渐变
 */
export const GradientPresets = {
  // 水平渐变
  horizontal: (colors: string[], coords: any): GradientColor => ({
    id: generateGradientId(),
    type: 'linear',
    colorStops: colors.map((color, index) => ({
      id: `stop_${index}`,
      offset: index / (colors.length - 1),
      color,
    })),
    coords: coords || { x1: 0, y1: 0.5, x2: 1, y2: 0.5 },
  }),

  // 垂直渐变
  vertical: (colors: string[], id?: string): GradientColor => ({
    id: id || generateGradientId(),
    type: 'linear',
    colorStops: colors.map((color, index) => ({
      id: `stop_${index}`,
      offset: index / (colors.length - 1),
      color,
    })),
    coords: { x1: 0.5, y1: 0, x2: 0.5, y2: 1 },
  }),

  // 对角线渐变
  diagonal: (colors: string[], id?: string): GradientColor => ({
    id: id || generateGradientId(),
    type: 'linear',
    colorStops: colors.map((color, index) => ({
      id: `stop_${index}`,
      offset: index / (colors.length - 1),
      color,
    })),
    coords: { x1: 0, y1: 0, x2: 1, y2: 1 },
  }),

  // 径向渐变
  radial: (colors: string[], id?: string): GradientColor => ({
    id: id || generateGradientId(),
    type: 'radial',
    colorStops: colors.map((color, index) => ({
      id: `stop_${index}`,
      offset: index / (colors.length - 1),
      color,
    })),
    coords: { cx: 0.5, cy: 0.5, r: 0.5 },
  }),

  // 彩虹渐变
  rainbow: (id?: string): GradientColor => ({
    id: id || generateGradientId(),
    type: 'linear',
    colorStops: [
      { id: 'red', offset: 0, color: '#ff0000' },
      { id: 'orange', offset: 0.16, color: '#ff7f00' },
      { id: 'yellow', offset: 0.33, color: '#ffff00' },
      { id: 'green', offset: 0.5, color: '#00ff00' },
      { id: 'blue', offset: 0.66, color: '#0000ff' },
      { id: 'indigo', offset: 0.83, color: '#4b0082' },
      { id: 'violet', offset: 1, color: '#9400d3' },
    ],
    coords: { x1: 0, y1: 0.5, x2: 1, y2: 0.5 },
  }),
};