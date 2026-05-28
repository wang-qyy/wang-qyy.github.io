class ColorSchemeGenerator {
  baseHues: number[];

  constructor() {
    // 基础色相
    this.baseHues = [0, 30, 60, 120, 180, 240, 300]; // 红橙黄绿青蓝紫
  }

  /**
   * 生成双色组合
   */
  generateDuoTone(baseHue: number) {
    const complementaryHue = (baseHue + 180) % 360;
    return [
      this.generateColor(baseHue, 60, 50), // 主色
      this.generateColor(complementaryHue, 50, 40), // 补色
    ];
  }

  /**
   * 生成三色组合
   */
  generateTriad(baseHue: number) {
    const triadHue1 = (baseHue + 120) % 360;
    const triadHue2 = (baseHue + 240) % 360;
    return [
      this.generateColor(baseHue, 70, 45), // 主色
      this.generateColor((baseHue + 120) % 360, 50, 55), // 对比色1
      this.generateColor((baseHue + 240) % 360, 40, 60), // 对比色2
    ];
  }

  /**
   * 生成四色组合
   */
  generateQuad(baseHue: number) {
    const analogous1 = (baseHue + 30) % 360;
    const analogous2 = (baseHue + 60) % 360;
    const complementary = (baseHue + 180) % 360;
    return [
      this.generateColor(baseHue, 70, 40), // 主色
      this.generateColor(analogous1, 50, 50), // 邻近色1
      this.generateColor(analogous2, 40, 60), // 邻近色2
      this.generateColor(complementary, 30, 70), // 补色
    ];
  }

  /**
   * 生成五色组合
   */
  generatePenta(baseHue: number) {
    const colors = [];
    colors.push(this.generateColor(baseHue, 80, 35)); // 主色系
    colors.push(this.generateColor(baseHue, 60, 50));
    colors.push(this.generateColor(baseHue, 40, 65));

    const complementary = (baseHue + 180) % 360;
    colors.push(this.generateColor(complementary, 50, 45)); // 对比色

    const analogousComp = (baseHue + 210) % 360;
    colors.push(this.generateColor(analogousComp, 30, 70)); // 邻近对比色

    return colors;
  }

  toRgbStr({ r, g, b }: { r: number; g: number; b: number }) {
    return `rgb(${r},${g},${b})`;
  }
  /**
   * 生成单个颜色
   */
  generateColor(hue: number, saturation: number, lightness: number) {
    const { r, g, b } = hslToRgb(hue, saturation, lightness);
    return `rgb(${r},${g},${b})`;
  }

  /**
   * RGB转HSL
   */
  rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  // 相邻色
  getLightColor(color: { r: number; g: number; b: number }, radio: number) {
    const { r, g, b } = color;
    return {
      r: Math.min(255, Math.floor(r + (255 - r) * radio)),
      g: Math.min(255, Math.floor(g + (255 - g) * radio)),
      b: Math.min(255, Math.floor(b + (255 - b) * radio)),
    };
  }
  /**
   * 根据输入的RGB颜色生成配色组合（包含输入颜色）
   */
  generateCombinationFromRgb(rgbString: string, count: number) {
    // 解析输入的RGB颜色
    const rgb = parseRgb(rgbString);
    const { r, g, b } = rgb;

    // 将RGB转换为HSL，获取色相值
    const { h: hue, l, s } = this.rgbToHsl(r, g, b);

    // 输入颜色作为主色加入结果
    const result = [rgbString];

    switch (count) {
      case 2:
        return [
          rgbString,
          this.toRgbStr(this.getLightColor(rgb, 0.4)),

          // x,z,y
          // this.generateColor((hue + 120) % 360, 50, 55), // 对比色1
          // this.generateColor((hue + 240) % 360, 40, 60), // 对比色2
          // this.generateColor((hue + 30) % 360, 50, 50), // 邻近色1
          // this.generateColor((hue + 60) % 360, 40, 60), // 邻近色2
          // this.generateColor((hue + 180) % 360, 30, 70), // 补色
          // this.generateColor(hue, 60, 50), // 主色系变化
          // this.generateColor(hue, 40, 65), // 主色系变化
          // this.generateColor((hue + 180) % 360, 50, 45), // 对比色
          // this.generateColor((hue + 210) % 360, 30, 70), // 邻近对比色
        ];
      case 3:
        return [
          rgbString,
          this.toRgbStr(this.getLightColor(rgb, 0.4)),
          this.toRgbStr(this.getLightColor(rgb, 0.7)),
        ];

      case 4:
        return [
          rgbString,
          this.toRgbStr(this.getLightColor(rgb, 0.4)),
          this.toRgbStr(this.getLightColor(rgb, 0.7)),
          this.generateColor((hue + 180) % 360, 50, 45), // 对比色
        ];
      case 5:
        return [
          rgbString,
          this.toRgbStr(this.getLightColor(rgb, 0.4)),
          this.toRgbStr(this.getLightColor(rgb, 0.7)),
          this.toRgbStr(this.getLightColor(rgb, 0.9)),
        ];
    }

    return result;
  }
}

// 导出实例
export const colorGenerator = new ColorSchemeGenerator();

/**
 * HSL转RGB
 */
function hslToRgb(h: number, s: number, l: number) {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * 解析RGB字符串
 */
function parseRgb(rgbString: string) {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) {
    throw new Error("Invalid RGB format");
  }
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
  };
}
