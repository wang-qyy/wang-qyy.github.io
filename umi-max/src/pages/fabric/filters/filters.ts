export interface Filters {
  resId?: string;
  brightness?: number; // 亮度 [-1 ~ 1]
  saturate?: number; // 饱和度 [-1 ~ 1]
  contrast?: number; // 对比度 [-1 ~ 1]
  blur?: number; // 模糊 [0 ~ 1]
  sharpen?: number; // 锐化 [0 ~ 1]
  strong?: number; // 滤镜强度 [0 ~ 1]
  "gamma-r"?: number; // red通道 [0.01 ~ 2.2]
  "gamma-g"?: number; // green 通道 [0.01 ~ 2.2]
  "gamma-b"?: number; // blue 通道 [0.01 ~ 2.2]
  hue?: number; // 色相 [-2 ~ 2]
  saturation?: number;
}

/**
 * 将 Fabric.js 滤镜转换为 SVG 滤镜定义
 * @param {Array} fabricFilters - Fabric.js 滤镜数组
 * @param {string} filterId - SVG 滤镜的唯一ID
 * @returns {string} SVG 滤镜定义字符串
 */
function fabricFiltersToSVGFilter(
  fabricFilters: Filters,
  filterId = "custom-filter"
) {
  if (!fabricFilters || Object.keys(fabricFilters).length === 0) {
    return "";
  }

  const filterAttributes: { [key: string]: string }[] = [];
  const filterElements: string[] = [];
  let filterUnits = "userSpaceOnUse";

  // 遍历所有 Fabric.js 滤镜
  Object.keys(fabricFilters).forEach((type, index) => {
    // @ts-ignore
    const filter = fabricFilters[type];

    switch (type.toLowerCase()) {
      case "brightness":
        filterElements.push(createBrightnessFilter(filter));
        break;
      case "contrast":
        filterElements.push(createContrastFilter(filter));
        break;
      case "saturation":
        filterElements.push(createSaturationFilter(filter));
        break;
      case "blur":
        filterElements.push(createBlurFilter(filter));
        filterUnits = "objectBoundingBox";
        break;
      case "grayscale":
        filterElements.push(createGrayscaleFilter(filter));
        break;
      case "sepia":
        filterElements.push(createSepiaFilter(filter));
        break;
      case "invert":
        filterElements.push(createInvertFilter(filter));
        break;
      case "huerotation":
      case "hue":
        filterElements.push(createHueRotateFilter(filter));
        break;
      case "noise":
        filterElements.push(createNoiseFilter(filter));
        break;
      case "pixelate":
        filterElements.push(createPixelateFilter(filter));
        break;
      default:
        console.warn(`不支持的滤镜类型: ${type}`);
    }
  });

  // 构建完整的 SVG 滤镜
  return `
    <filter id="${filterId}" 
            filterUnits="${filterUnits}"
            ${filterAttributes.join(" ")}>
      ${filterElements.join("\n      ")}
    </filter>
  `.trim();
}

// 亮度滤镜
function createBrightnessFilter(brightness = 0) {
  const amount = 1 + brightness / 100;
  return `<feComponentTransfer>
    <feFuncR type="linear" slope="${amount}" />
    <feFuncG type="linear" slope="${amount}" />
    <feFuncB type="linear" slope="${amount}" />
  </feComponentTransfer>`;
}

// 对比度滤镜
function createContrastFilter(contrast: number = 0) {
  const amount = 1 + contrast / 100;
  const intercept = (1 - amount) / 2;
  return `<feComponentTransfer>
    <feFuncR type="linear" slope="${amount}" intercept="${intercept}" />
    <feFuncG type="linear" slope="${amount}" intercept="${intercept}" />
    <feFuncB type="linear" slope="${amount}" intercept="${intercept}" />
  </feComponentTransfer>`;
}

// 饱和度滤镜
function createSaturationFilter(saturation = 0) {
  const amount = saturation / 100;
  return `<feColorMatrix type="saturate" values="${1 - amount}" />`;
}

// 模糊滤镜
function createBlurFilter(blur = 0) {
  return `<feGaussianBlur stdDeviation="${blur}" />`;
}

// 灰度滤镜
function createGrayscaleFilter(grayscale = 0) {
  const amount = grayscale / 100;
  return `<feColorMatrix type="matrix" values="
    ${0.2126 + 0.7874 * (1 - amount)} ${0.7152 - 0.7152 * (1 - amount)} ${0.0722 - 0.0722 * (1 - amount)} 0 0
    ${0.2126 - 0.2126 * (1 - amount)} ${0.7152 + 0.2848 * (1 - amount)} ${0.0722 - 0.0722 * (1 - amount)} 0 0
    ${0.2126 - 0.2126 * (1 - amount)} ${0.7152 - 0.7152 * (1 - amount)} ${0.0722 + 0.9278 * (1 - amount)} 0 0
    0 0 0 1 0" />`;
}

// 深褐色滤镜
function createSepiaFilter(sepia = 0) {
  const amount = sepia / 100;
  return `<feColorMatrix type="matrix" values="
    ${0.393 + 0.607 * (1 - amount)} ${0.769 - 0.769 * (1 - amount)} ${0.189 - 0.189 * (1 - amount)} 0 0
    ${0.349 - 0.349 * (1 - amount)} ${0.686 + 0.314 * (1 - amount)} ${0.168 - 0.168 * (1 - amount)} 0 0
    ${0.272 - 0.272 * (1 - amount)} ${0.534 - 0.534 * (1 - amount)} ${0.131 + 0.869 * (1 - amount)} 0 0
    0 0 0 1 0" />`;
}

// 反色滤镜
function createInvertFilter(invert = 0) {
  const amount = invert / 100;
  return `<feComponentTransfer>
    <feFuncR type="table" tableValues="${amount} ${1 - amount}" />
    <feFuncG type="table" tableValues="${amount} ${1 - amount}" />
    <feFuncB type="table" tableValues="${amount} ${1 - amount}" />
  </feComponentTransfer>`;
}

// 色相旋转滤镜
function createHueRotateFilter(rotation = 0) {
  return `<feColorMatrix type="hueRotate" values="${rotation}" />`;
}

// 噪点滤镜
function createNoiseFilter(noise = 0) {
  const seed = Math.floor(Math.random() * 1000);
  return `
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="${seed}" result="noise" />
    <feColorMatrix type="saturate" values="0" />
    <feComposite operator="in" in2="SourceGraphic" />
    <feBlend mode="multiply" opacity="${noise / 100}" />
  `;
}

// 像素化滤镜
function createPixelateFilter(blocksize = 0) {
  return `
    <feFlood x="4" y="4" height="2" width="2"/>
    <feComposite width="${blocksize}" height="${blocksize}"/>
    <feTile result="a"/>
    <feComposite in="SourceGraphic" in2="a" operator="in"/>
    <feMorphology operator="dilate" radius="${blocksize / 2}"/>
  `;
}

/**
 * 应用 SVG 滤镜到 DOM 元素
 * @param {HTMLElement} element - 要应用滤镜的 DOM 元素
 * @param {Array} fabricFilters - Fabric.js 滤镜数组
 * @param {string} filterId - 滤镜ID
 */
function applySVGFilterToElement(
  element,
  fabricFilters,
  filterId = "custom-filter"
) {
  if (!element || !fabricFilters) return;

  // 创建 SVG 滤镜定义
  const svgFilter = fabricFiltersToSVGFilter(fabricFilters, filterId);

  if (!svgFilter) return;

  // 检查是否已存在 SVG 滤镜容器
  let svgContainer = document.getElementById("svg-filters-container");
  if (!svgContainer) {
    svgContainer = document.createElement("div");
    svgContainer.id = "svg-filters-container";
    svgContainer.style.position = "absolute";
    svgContainer.style.width = "0";
    svgContainer.style.height = "0";
    svgContainer.style.overflow = "hidden";
    document.body.appendChild(svgContainer);
  }

  // 添加新的滤镜定义
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("xmlns", svgNS);
  svg.style.position = "absolute";
  svg.style.width = "0";
  svg.style.height = "0";
  svg.innerHTML = svgFilter;
  svgContainer.appendChild(svg);

  // 应用滤镜到元素
  element.style.filter = `url(#${filterId})`;
}

/**
 * 创建包含滤镜的 SVG 图像
 * @param {string} imageUrl - 图片URL
 * @param {Array} fabricFilters - Fabric.js 滤镜数组
 * @param {number} width - 图片宽度
 * @param {number} height - 图片高度
 * @returns {string} 包含滤镜的 SVG 字符串
 */
function createSVGWithFilters(
  imageUrl: string,
  fabricFilters: Filters,
  width: number,
  height: number
) {
  const filterId = "image-filter";
  const svgFilter = fabricFiltersToSVGFilter(fabricFilters, filterId);

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${svgFilter}
      </defs>
      <image 
        href="${imageUrl}" 
        width="${width}" 
        height="${height}" 
        filter="url(#${filterId})" />
    </svg>
  `;
}

// 导出主要函数
export {
  fabricFiltersToSVGFilter,
  applySVGFilterToElement,
  createSVGWithFilters,
};
