// 滤镜调节默认值
export const defaultFilters: Readonly<FiltersMapData> = {
  blur: 0, // 模糊 [0 ~ 1]
  brightness: 0, // 亮度 [-1 ~ 1]
  contrast: 0, // 对比度 [-1 ~ 1]
  "gamma-r": 1, // red 通道 [0.01 ~ 2.2]
  "gamma-g": 1, // green 通道 [0.01 ~ 2.2]
  "gamma-b": 1, // blue 通道 [0.01 ~ 2.2]
  hue: 0, // 色相 [-1 ~ 1]
  saturate: 0, // 饱和度 [-1 ~ 1]
  sharpen: 0, // 锐化 [0 ~ 1]
  //
  strong: 1, // 滤镜强度 [0 ~ 1]
};

export interface FiltersMapData {
  blur: number;
  brightness: number;
  contrast: number;
  "gamma-r": number;
  "gamma-g": number;
  "gamma-b": number;
  hue: number;
  saturate: number;
  sharpen: number;
  strong: number;
}

export type FiltersKeys = keyof FiltersMapData;
export function createSVGFilter(
  filtersMap: FiltersMapData,
  filterid: string
): string {
  // 预处理参数（与原始函数相同）
  (Object.keys(filtersMap) as FiltersKeys[]).forEach((key) => {
    const val = parseFloat(filtersMap[key] as any);
    filtersMap[key] = isNaN(val) ? defaultFilters[key] : val;
  });

  const strong = filtersMap.strong ?? defaultFilters.strong;

  // 存储各阶段滤镜结果
  const steps: string[] = [];
  let input = "SourceGraphic";

  // 1. 模糊滤镜 (feGaussianBlur)
  if (filtersMap.blur !== defaultFilters.blur) {
    const blurValue = filtersMap.blur * strong;
    steps.push(
      `<feGaussianBlur in="${input}" stdDeviation="${blurValue}" result="blurOutput" />`
    );
    input = "blurOutput";
  }

  // 2. 亮度和对比度 (feComponentTransfer)
  if (
    filtersMap.brightness !== defaultFilters.brightness ||
    filtersMap.contrast !== defaultFilters.contrast
  ) {
    const brightness = filtersMap.brightness * strong;
    const contrast = filtersMap.contrast * strong;

    // 亮度和对比度组合公式
    const slope = 1 + contrast;
    const intercept = -0.5 * contrast + brightness;

    steps.push(`
      <feComponentTransfer in="${input}" result="brightContrastOutput">
        <feFuncR type="linear" slope="${slope}" intercept="${intercept}"/>
        <feFuncG type="linear" slope="${slope}" intercept="${intercept}"/>
        <feFuncB type="linear" slope="${slope}" intercept="${intercept}"/>
      </feComponentTransfer>
    `);
    input = "brightContrastOutput";
  }

  // 3. 色相旋转 (feColorMatrix)
  if (filtersMap.hue !== defaultFilters.hue) {
    const hueValue = filtersMap.hue * 180 * strong; // 转换为角度
    steps.push(
      `<feColorMatrix in="${input}" type="hueRotate" values="${hueValue}" result="hueOutput" />`
    );
    input = "hueOutput";
  }

  // 4. 饱和度 (feColorMatrix)
  if (filtersMap.saturate !== defaultFilters.saturate) {
    const saturation = 1 + filtersMap.saturate * strong;
    steps.push(
      `<feColorMatrix in="${input}" type="saturate" values="${saturation}" result="saturationOutput" />`
    );
    input = "saturationOutput";
  }

  // 5. Gamma 校正 (feComponentTransfer)
  if (
    filtersMap["gamma-r"] !== defaultFilters["gamma-r"] ||
    filtersMap["gamma-g"] !== defaultFilters["gamma-g"] ||
    filtersMap["gamma-b"] !== defaultFilters["gamma-b"]
  ) {
    const gammaR = (filtersMap["gamma-r"] - 1) * strong + 1;
    const gammaG = (filtersMap["gamma-g"] - 1) * strong + 1;
    const gammaB = (filtersMap["gamma-b"] - 1) * strong + 1;

    steps.push(`
      <feComponentTransfer in="${input}" result="gammaOutput">
        <feFuncR type="gamma" exponent="${1 / gammaR}" amplitude="1"/>
        <feFuncG type="gamma" exponent="${1 / gammaG}" amplitude="1"/>
        <feFuncB type="gamma" exponent="${1 / gammaB}" amplitude="1"/>
      </feComponentTransfer>
    `);
    input = "gammaOutput";
  }

  // 6. 锐化 (feConvolveMatrix)
  if (filtersMap.sharpen !== defaultFilters.sharpen) {
    const sharpenValue = filtersMap.sharpen * strong;
    const center = 1 + sharpenValue;
    const boundary = -(sharpenValue / 8);

    const matrix = [
      boundary,
      boundary,
      boundary,
      boundary,
      center,
      boundary,
      boundary,
      boundary,
      boundary,
    ].join(" ");

    steps.push(
      `<feConvolveMatrix in="${input}" result="sharpenOutput" kernelMatrix="${matrix}" />`
    );
    input = "sharpenOutput";
  }

  // 组合所有滤镜
  return `<filter id="${filterid}" x="0" y="0" width="100%" height="100%">${steps.join("")}</filter>`;
}
