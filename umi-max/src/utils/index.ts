export function mouseMoveDistance(
  e: MouseEvent | React.MouseEvent,
  cb: (distanceX: number, distanceY: number) => void,
  finish?: (distanceX: number, distanceY: number) => void
) {
  const mouseDownPointX = e.clientX;
  const mouseDownPointY = e.clientY;

  const mouseMove = (event: MouseEvent) => {
    const currentX = event.clientX;
    const currentY = event.clientY;

    cb && cb(currentX - mouseDownPointX, currentY - mouseDownPointY);
  };

  const mouseUp = (event: MouseEvent) => {
    const currentX = event.clientX;
    const currentY = event.clientY;

    finish && finish(currentX - mouseDownPointX, currentY - mouseDownPointY);
    window.removeEventListener("mouseup", mouseUp);
    window.removeEventListener("mousemove", mouseMove);
  };

  window.addEventListener("mouseup", mouseUp);
  window.addEventListener("mousemove", mouseMove);
}

/**
 * rbga字符串转rgba对象  'rgba(0,0,0,1)'
 * @param color
 */
export function StringToRGBA(color: string) {
  if (typeof color === "string") {
    color = color.replaceAll("rgb(", "");
    color = color.replaceAll(")", "");
    const strList = color.split(",");
    return {
      r: parseInt(strList[0], 10),
      g: parseInt(strList[1], 10),
      b: parseInt(strList[2], 10),
    };
  }
  return color;
}

// 生成完整配色方案
export function generateColorPalette(mainColor: {
  r: number;
  g: number;
  b: number;
}) {
  const { r, g, b } = mainColor;

  // 计算调整系数
  const brightness = (r + g + b) / 3;

  return {
    // 深色：各通道减少20%-30%
    dark: [
      Math.max(0, Math.floor(r * 0.7)),
      Math.max(0, Math.floor(g * 0.7)),
      Math.max(0, Math.floor(b * 0.7)),
    ],

    // 主色：保持不变
    main: [r, g, b],

    // 浅色：向白色靠拢
    light: [
      Math.min(255, Math.floor(r + (255 - r) * 0.4)),
      Math.min(255, Math.floor(g + (255 - g) * 0.4)),
      Math.min(255, Math.floor(b + (255 - b) * 0.4)),
    ],

    // 更浅：继续变亮
    lighter: [
      Math.min(255, Math.floor(r + (255 - r) * 0.7)),
      Math.min(255, Math.floor(g + (255 - g) * 0.7)),
      Math.min(255, Math.floor(b + (255 - b) * 0.7)),
    ],

    // 背景色：接近白色
    background: [
      Math.min(255, Math.floor(r + (255 - r) * 0.9)),
      Math.min(255, Math.floor(g + (255 - g) * 0.9)),
      Math.min(255, Math.floor(b + (255 - b) * 0.9)),
    ],
  };
}

// 使用示例
const bluePalette = generateColorPalette({ r: 33, g: 150, b: 243 });
console.log(bluePalette);

/**
 * 生成颜色预设
 * @param {number} numColors - 颜色数量（2-5）
 * @param {Object} options - 配置选项
 * @returns {Array<Array<string>>} - 颜色预设数组
 */
function generateColorPresets(numColors: number, options = {}) {
  const {
    numPresets = 10, // 生成多少组预设
    baseHue = 0, // 基础色相 (0-360)
    saturation = 0.7, // 饱和度 (0-1)
    lightness = 0.5, // 基础亮度 (0-1)
    includeNeutrals = true, // 是否包含中性色
  } = options;

  const presets = [];

  for (let i = 0; i < numPresets; i++) {
    const preset = [];
    const hueStep = 360 / Math.max(numColors, 1);

    for (let j = 0; j < numColors; j++) {
      let color;

      // 处理不同类型的颜色组合
      if (numColors === 2) {
        // 双色组合：一个主色 + 一个对比色
        if (j === 0) {
          color = generateHSL(baseHue + i * 30, saturation, lightness);
        } else {
          color = includeNeutrals
            ? generateHSL(0, 0, 0.9 - j * 0.2) // 灰色系
            : generateHSL(baseHue + i * 30 + 180, saturation, lightness - 0.2);
        }
      } else if (numColors === 3) {
        // 三色组合：类似色或互补色
        if (j === 0) {
          color = generateHSL(baseHue + i * 30, saturation, lightness);
        } else if (j === 1) {
          color = generateHSL(
            baseHue + i * 30 + 30,
            saturation,
            lightness + 0.1
          );
        } else {
          color = generateHSL(
            baseHue + i * 30 + 180,
            saturation * 0.8,
            lightness - 0.1
          );
        }
      } else if (numColors === 4) {
        // 四色组合：类似色 + 互补色
        const hue = baseHue + i * 25;
        if (j === 0) {
          color = generateHSL(hue, saturation, lightness);
        } else if (j === 1) {
          color = generateHSL(hue + 30, saturation, lightness + 0.1);
        } else if (j === 2) {
          color = generateHSL(hue + 60, saturation * 0.9, lightness + 0.2);
        } else {
          color = generateHSL(hue + 180, saturation * 0.6, lightness - 0.1);
        }
      } else if (numColors === 5) {
        // 五色组合：更丰富的配色方案
        const hue = baseHue + i * 20;
        if (j === 0) {
          color = generateHSL(hue, saturation, lightness);
        } else if (j < 3) {
          color = generateHSL(hue + j * 30, saturation, lightness + j * 0.1);
        } else if (j === 3) {
          color = includeNeutrals
            ? generateHSL(0, 0.1, 0.95) // 接近白色
            : generateHSL(hue + 120, saturation * 0.7, lightness + 0.3);
        } else {
          color = generateHSL(hue + 180, saturation * 0.5, lightness - 0.2);
        }
      }

      preset.push(color);
    }

    // 确保颜色按亮度排序（深到浅）
    preset.sort((a, b) => {
      const brightnessA = getBrightness(a);
      const brightnessB = getBrightness(b);
      return brightnessB - brightnessA; // 从深到浅
    });

    presets.push(preset);
  }

  return presets;
}

/**
 * 生成HSL颜色
 */
function generateHSL(h, s, l) {
  h = ((h % 360) + 360) % 360; // 确保色相在0-360范围内
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/**
 * 计算颜色亮度（用于排序）
 */
function getBrightness(color) {
  // 简化亮度计算：对于HSL，亮度值可以直接使用
  const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (match) {
    return parseInt(match[3]) / 100;
  }
  return 0.5;
}

/**
 * 生成示例并展示在控制台
 */
function demoColorPresets() {
  // console.log("双色预设示例:");
  // console.table(generateColorPresets(2)[0]);
  // console.log("三色预设示例:");
  // console.table(generateColorPresets(3)[0]);
  // console.log("四色预设示例:");
  // console.table(generateColorPresets(4)[0]);
  // console.log("五色预设示例:");
  // console.table(generateColorPresets(5)[0]);
}

// 执行示例
demoColorPresets();

// 生成10组双色预设
export const twoColorPresets = generateColorPresets(2);

// 生成自定义配置的四色预设
export const fourColorPresets = generateColorPresets(4, {
  numPresets: 8,
  baseHue: 200, // 蓝色系
  saturation: 0.8,
  lightness: 0.6,
  includeNeutrals: false,
});

// 查看第一组预设
// console.log("双色预设第一组:", twoColorPresets[0]);
// console.log("四色预设第一组:", fourColorPresets[0]);
