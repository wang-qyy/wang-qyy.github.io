import fabric from 'fabric';
import type { Asset, Filters, RGBA, ImageEffects } from '@kernel/typing';

interface FilterBaseValueType {
  horizontalFlip: number;
  verticalFlip: number;
  width: number;
  height: number;
}

interface Layer {
  offsetX: number;
  offsetY: number;
  color: RGBA;
  blur: number;
  strokeWidth: number;
}

export class HandleFilter {
  imgInstance: fabric.Image;

  filters: Filters;

  filterStrong = 1;

  // @ts-ignore
  filterValueListen: Filters = {
    brightness: 0,
    saturate: 0,
    hue: 0,
    contrast: 0,
    blur: 0,
    sharpen: 0,
  };

  filterBaseValueListen: FilterBaseValueType = {
    horizontalFlip: 0,
    verticalFlip: 0,
    width: 0,
    height: 0,
  };

  constructor({
    imgInstance,
    filters,
  }: {
    imgInstance: fabric.Image;
    filters: Filters;
  }) {
    this.imgInstance = imgInstance;
    this.filters = filters;

    this.init();
  }

  static fabricAttrMapping = {
    brightness: {
      value: 'brightness',
      fabricAttr: 'Brightness',
      filterAttr: 'brightness',
    },
    saturate: {
      value: 'saturate',
      fabricAttr: 'Saturation',
      filterAttr: 'saturation',
    },
    hue: {
      value: 'hue',
      fabricAttr: 'HueRotation',
      filterAttr: 'rotation',
    },
    contrast: {
      value: 'contrast',
      fabricAttr: 'Contrast',
      filterAttr: 'contrast',
    },
    blur: {
      value: 'blur',
      fabricAttr: 'Blur',
      filterAttr: 'blur',
    },
    sharpen: {
      value: 'sharpen',
      fabricAttr: 'Brightness',
      filterAttr: 'matrix',
    },
    gamma: {
      value: 'gamma',
      fabricAttr: 'Gamma',
      filterAttr: 'gamma',
    },
  };

  static attrMappingList = Object.keys(HandleFilter.fabricAttrMapping) as Array<
    keyof typeof HandleFilter.fabricAttrMapping
  >;

  static filterItem = [
    'blur',
    'brightness',
    'contrast',
    'gamma-b',
    'gamma-g',
    'gamma-r',
    'hue',
    'saturate',
    'sharpen',
    'strong',
  ];

  processAttr = (
    imgInstance: fabric.Image,
    filterType: string,
    filterValue: any,
  ) => {
    const { brightness, gamma, saturate, contrast, sharpen, hue, blur } =
      HandleFilter.fabricAttrMapping;

    let filters: any[] = [];
    switch (filterType) {
      case brightness.value: {
        /* 亮度 START */
        filters = [
          'Brightness',
          {
            brightness: parseFloat(filterValue),
          },
        ];

        break;
      }

      case gamma.value: {
        // 色温 / 色调 START
        filters = [
          'Gamma',
          {
            gamma: [
              parseFloat(filterValue[0]),
              parseFloat(filterValue[1]),
              parseFloat(filterValue[2]),
            ],
          },
        ];
        break;
      }
      case saturate.value: {
        /* 饱和度 START */
        filters = [
          'Saturation',
          {
            saturation: parseFloat(filterValue),
          },
        ];
        break;
      }
      case contrast.value: {
        /* 对比度 START */
        filters = [
          'Contrast',
          {
            contrast: parseFloat(filterValue),
          },
        ];
        break;
      }
      case hue.value: {
        /* 偏色 START */
        filters = [
          'HueRotation',
          {
            rotation: parseFloat(filterValue),
          },
        ];
        break;
      }
      case blur.value: {
        /* 模糊 START */
        filters = [
          'Blur',
          {
            blur: parseFloat(filterValue),
          },
        ];
        break;
      }
      case sharpen.value: {
        /* 锐化 START */
        const centerValue = 1 + filterValue;
        const boundaryValue = -(filterValue / 8);
        filters = [
          'Convolute',
          {
            matrix: [
              boundaryValue,
              boundaryValue,
              boundaryValue,
              boundaryValue,
              centerValue,
              boundaryValue,
              boundaryValue,
              boundaryValue,
              boundaryValue,
            ],
          },
        ];
        break;
      }
    }
    const [key, value] = filters;

    imgInstance?.filters?.push(
      // @ts-ignore
      new fabric.Image.filters[key](value),
    );
    return imgInstance;
  };

  getFilterInfo = () => {
    const { filters } = this;

    const strong = filters?.strong ?? 1;
    const { fabricAttrMapping, filterItem, attrMappingList } = HandleFilter;
    return {
      filters,
      strong,
      fabricAttrMapping,
      filterItem,
      attrMappingList,
    };
  };

  init = () => {
    this.handleUpdate();
  };

  handleUpdate = () => {
    const { strong, filters, attrMappingList } = this.getFilterInfo();

    const filterValueList = {
      ...filters,
      gamma: [
        filters['gamma-r'] ?? 1,
        filters['gamma-g'] ?? 1,
        filters['gamma-b'] ?? 1,
      ],
    };
    // @ts-ignore
    for (const key of attrMappingList) {
      if (
        // @ts-ignore
        this.filterValueListen[key] === filterValueList[key] &&
        strong === this.filterStrong
      ) {
        // @ts-ignore
        continue;
      }
      this.filterStrong = strong;

      let filter_value;
      if (key === 'gamma') {
        filter_value = filterValueList[key].map(value => {
          return (value - 1) * strong + 1;
        });
      } else {
        filter_value = filterValueList[key] * strong;
      }

      this.processAttr(this.imgInstance, key, filter_value);
    }
    this.imgInstance.applyFilters();
  };

  getImgInstance = () => {
    return this.imgInstance;
  };
}

export class HandleFabric {
  node: HTMLCanvasElement;

  canvas: fabric.StaticCanvas | undefined;

  context: CanvasRenderingContext2D | undefined;

  asset: Asset | undefined;

  imgInstance: fabric.Image | undefined;

  svgInstance: fabric.Image | undefined;

  imageEffectsInstance: any[] = [];

  scale: {
    scaleX: number;
    scaleY: number;
  } = {
    scaleX: 1,
    scaleY: 1,
  };

  constructor(node: HTMLCanvasElement) {
    this.node = node;
    this.init();
  }

  init = () => {
    try {
      // 使用 CPU 渲染
      fabric.filterBackend = new fabric.Canvas2dFilterBackend();

      this.canvas = new fabric.StaticCanvas(this.node);
      this.context = this.canvas.getContext();
    } catch (e: any) {
      throw new Error(e);
    }
  };

  replaceImgInstance = (imgInstance: fabric.Image) => {
    if (!imgInstance) return;

    if (this.imgInstance && this.canvas) {
      this.canvas.remove(this.imgInstance);
      this.imgInstance = imgInstance;
      this.canvas.add(imgInstance);
    }
  };

  replaceSvgInstance = (svgInstance: fabric.Image) => {
    if (!svgInstance) {
      return;
    }
    this.svgInstance = svgInstance;
  };

  updateCanvasBgInfo = () => {
    if (this.imgInstance && this.asset && this.canvas) {
      const { attribute } = this.asset;
      const { width, height } = attribute;
      const { container } = attribute;

      const realWidth = container?.width ?? width;
      const realHeight = container?.height ?? height;

      this.imgInstance.set({
        left: container?.posX ?? 0,
        top: container?.posY ?? 0,
        scaleX: realWidth / (this?.imgInstance?.width ?? 1),
        scaleY: realHeight / (this?.imgInstance?.height ?? 1),
        selectable: false,
        clipPath: this.svgInstance,
      });

      this.canvas.setDimensions({
        width: realWidth,
        height: realHeight,
      });
    }
  };

  updateSvgInfo = () => {
    if (!this.svgInstance) return;

    this.svgInstance.set({
      ...this.scale,
      absolutePositioned: true,
    });
  };

  replaceImageEffect = ({ instances }: { instances: any }) => {
    if (this.imageEffectsInstance) {
      this.imageEffectsInstance.forEach(item => {
        this.canvas && this.canvas.remove(item);
      });
    }
    this.imageEffectsInstance = instances;
  };

  updateImageEffect = () => {
    if (this.imageEffectsInstance && this.canvas) {
      this.imageEffectsInstance.forEach(item => {
        this.canvas?.add(item);
        this.canvas?.sendBackwards(item);
      });
    }
  };

  render = (
    asset: Asset,
    scale: {
      scaleX: number;
      scaleY: number;
    },
  ) => {
    this.asset = asset;
    this.scale = scale;
    this.updateSvgInfo();
    this.updateCanvasBgInfo();

    setTimeout(() => {
      this.canvas?.renderAll();
    });
  };
}

export class HandleImageEffects {
  /**
   *
   * @param {number} size 图片的宽或高
   * @param {number} sw 边框宽
   * @param {number} p1 (top btm)/(left right)
   * @param {number} p2 (top btm)/(left right)
   * @returns {number}
   */
  static createLayerSize(size: number, sw: number, p1: number, p2: number) {
    const m1 = size + sw * 2;
    const m2 = Math.max(Math.abs(p1) - sw, 0);
    const m3 = Math.max(Math.abs(p2) - sw, 0);

    // return Math.round(m1 + m2 + m3)
    return m1 + m2 + m3;
  }

  /**
   *
   * @param {number} sw 边框宽
   * @param {number} p (top btm left right)
   * @returns {number}
   */
  static createLayerPosition(sw: number, p: number) {
    const m = p >= 0 || p + sw >= 0 ? -sw : p;
    // return Math.round(m)
    return m;
  }

  static rgbObjToStr(color: RGBA) {
    const { r, g, b, a } = color;
    const base = a ? 'rgba' : 'rgb';
    const rgb = `${r},${g},${b}`;
    const _a = a ? `,${a}` : '';
    return `${base}(${rgb}${_a})`;
  }

  imageEffects: ImageEffects;

  asset: Asset;

  image: HTMLImageElement;

  needCompensation: boolean;

  // 缩放率补偿值
  scaleRateSizeCompensation = 2;

  needScaleRateSize = 2000;

  // 最大尺寸补偿值，如果觉得补偿后图片尺寸过大，可以减小
  maxSizeCompensation = 0.5;

  canvas: HTMLCanvasElement | OffscreenCanvas | undefined;

  resultCanvas: HTMLCanvasElement | undefined;

  ctx:
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | undefined
    | null;

  resultCtx: CanvasRenderingContext2D | undefined | null;

  size: any;

  instances: any[];

  /**
   *
   * @param {Object} data
   * @param {Object} data.imageEffects
   * @param {Object} data.image
   * @param {Boolean} data.needCompensation 是否开启角度补偿，带角的图形，strokeWidth在角处会比直线宽度更宽
   */
  constructor({
    imageEffects,
    asset,
    image,
    needCompensation = false,
  }: {
    imageEffects: any;
    asset: Asset;
    image: HTMLImageElement;
    needCompensation?: boolean;
  }) {
    this.imageEffects = imageEffects;
    this.asset = asset;
    this.image = image;
    this.needCompensation = needCompensation;

    this.size = {};
    this.instances = [];

    this.init();
  }

  static calculateSizeCompensation(strong: number, maxSc: number) {
    const base = 2 - strong;
    // 空白边距，如果觉得空白边距太大，可以适当调整
    const padding = 0.4;
    return 1 + base * maxSc * padding;
  }

  /**
   *
   * @param {Object} imageEffects
   * @param {Array} imageEffects.layers
   * @param {number} imageEffects.strong
   * @param {Object} imageSize
   * @param {number} imageSize.width
   * @param {number} imageSize.height
   * @param {Object} [options]
   * @param {Object} [options.needScaleRateSize]
   * @param {Object} [options.needCompensation]
   * @param {Object} [options.maxSizeCompensation]
   * @return {{imgWidth: number, renderLayer: [], absTop: number, top: number, left: number, width: number, absLeft: number, imgHeight: number, scaleRate: number, height: number}}
   */
  static calcImageEffectsSize = (
    imageEffects: ImageEffects,
    imageSize: { width: number; height: number },
    options?: {
      needScaleRateSize: number;
      needCompensation: boolean;
      maxSizeCompensation: number;
    },
  ) => {
    const { createLayerSize, createLayerPosition, calculateSizeCompensation } =
      HandleImageEffects;
    const { layers, strong } = imageEffects;
    const { width: originWidth, height: originHeight } = imageSize;
    const {
      needScaleRateSize = 2000,
      needCompensation = false,
      maxSizeCompensation = 0.5,
    } = options ?? {};

    let scaleRate = 1;
    // 处理缩放补偿
    if (originWidth >= originHeight) {
      if (originWidth > needScaleRateSize) {
        scaleRate = needScaleRateSize / originWidth;
      }
    } else if (originHeight > needScaleRateSize) {
      scaleRate = needScaleRateSize / originHeight;
    }

    let sizeComp = 1;
    // 处理尺寸补偿
    if (needCompensation) {
      const sc = calculateSizeCompensation(strong, maxSizeCompensation);
      sizeComp *= sc;
    }

    const imgWidth = originWidth * scaleRate;
    const imgHeight = originHeight * scaleRate;

    let maxStrokeWidth = 0;
    let minLeft = 0;
    let maxRight = 0;
    let minTop = 0;
    let maxBottom = 0;
    const renderLayer: Layer[] = [];

    layers.forEach((layer: any) => {
      const { stroke } = layer;
      let strokeWidth = stroke.width * strong * scaleRate;
      let offsetX = stroke.offsetX * strong * scaleRate;
      let offsetY = stroke.offsetY * strong * scaleRate;
      let blur = (stroke.blur || 0) * scaleRate;

      renderLayer.push({
        strokeWidth,
        offsetX,
        offsetY,
        blur,
        color: stroke.color,
      });

      strokeWidth *= sizeComp;
      offsetX *= sizeComp;
      offsetY *= sizeComp;
      blur *= sizeComp;

      maxStrokeWidth = Math.max(maxStrokeWidth, strokeWidth);
      minTop = Math.min(minTop, offsetY - blur);
      maxRight = Math.max(maxRight, offsetX + blur);
      maxBottom = Math.max(maxBottom, offsetY + blur);
      minLeft = Math.min(minLeft, offsetX - blur);
    });

    const top = createLayerPosition(maxStrokeWidth, minTop);
    const left = createLayerPosition(maxStrokeWidth, minLeft);
    const width = createLayerSize(imgWidth, maxStrokeWidth, minLeft, maxRight);
    const height = createLayerSize(
      imgHeight,
      maxStrokeWidth,
      minTop,
      maxBottom,
    );

    return {
      // width: Math.round(imgWidth + doubleStrokeWidth + Math.max(Math.abs(minLeft) - maxStrokeWidth, 0) + Math.max(Math.abs(maxRight) - maxStrokeWidth, 0)),
      width,
      // height: Math.round(imgHeight + doubleStrokeWidth + Math.max(Math.abs(minTop) - maxStrokeWidth, 0) + Math.max(Math.abs(maxBottom) - maxStrokeWidth, 0)),
      height,
      // left: Math.round((minLeft >= 0 || (minLeft + maxStrokeWidth) >= 0) ? -maxStrokeWidth : minLeft),
      left,
      // top: Math.round((minTop >= 0 || (minTop + maxStrokeWidth) >= 0) ? -maxStrokeWidth : minTop),
      top,
      absTop: Math.abs(top),
      absLeft: Math.abs(left),
      imgWidth,
      imgHeight,
      scaleRate,
      renderLayer,
    };
  };

  getScaleRateSize = (size: number) => {
    return size * this.scaleRateSizeCompensation;
  };

  createOffscreenCanvas = () => {
    const { width, height } = this.size;
    const srWidth = this.getScaleRateSize(width);
    const srHeight = this.getScaleRateSize(height);

    if (OffscreenCanvas) {
      this.canvas = new OffscreenCanvas(srWidth, srHeight);
    } else {
      this.canvas = document.createElement('canvas');
      this.canvas.width = srWidth;
      this.canvas.height = srHeight;
    }
  };

  createResultCanvas = () => {
    const { width, height } = this.size;

    this.resultCanvas = document.createElement('canvas');
    this.resultCanvas.width = width;
    this.resultCanvas.height = height;
    this.resultCtx = this.resultCanvas.getContext('2d');
    this.ctx = this.canvas?.getContext('2d');
  };

  init = () => {
    const { calcImageEffectsSize } = HandleImageEffects;
    this.size = calcImageEffectsSize(this.imageEffects, this.image, {
      needCompensation: this.needCompensation,
      needScaleRateSize: this.needScaleRateSize,
      maxSizeCompensation: this.maxSizeCompensation,
    });
    this.createOffscreenCanvas();
    this.createResultCanvas();
  };

  resultDrawCurrentCanvas = (
    left = 0,
    top = 0,
    width = this.size.width,
    height = this.size.height,
  ) => {
    if (this.canvas) {
      this.resultCtx?.drawImage(this.canvas, left, top, width, height);
    }
  };

  handleStroke = (layer: Layer) => {
    if (!this.ctx) {
      return;
    }
    const { strokeWidth, offsetX, offsetY, color } = layer;
    const { rgbObjToStr } = HandleImageEffects;
    const { absTop, absLeft, imgWidth, imgHeight } = this.size;

    for (let i = 0; i < 360; i++) {
      const x =
        strokeWidth * (1 + Math.cos(i)) - strokeWidth + absLeft + offsetX;
      const y =
        strokeWidth * (1 + Math.sin(i)) - strokeWidth + absTop + offsetY;
      this.ctx.drawImage(
        this.image,
        this.getScaleRateSize(x),
        this.getScaleRateSize(y),
        this.getScaleRateSize(imgWidth),
        this.getScaleRateSize(imgHeight),
      );
    }
    this.ctx.globalCompositeOperation = 'source-in';
    this.ctx.fillStyle = rgbObjToStr(color);
    this.ctx.fillRect(0, 0, this.canvas?.width ?? 0, this.canvas?.height ?? 0);

    this.resultDrawCurrentCanvas();
  };

  handleBlur = (layer: Layer) => {
    if (!this.ctx) {
      return;
    }

    const { offsetX, offsetY, color, blur } = layer;
    const { rgbObjToStr } = HandleImageEffects;
    const { absTop, absLeft, imgWidth, imgHeight } = this.size;

    this.ctx.shadowOffsetX = this.getScaleRateSize(offsetX);
    this.ctx.shadowOffsetY = this.getScaleRateSize(offsetY);
    this.ctx.shadowBlur = this.getScaleRateSize(blur);
    this.ctx.shadowColor = rgbObjToStr(color);

    this.ctx.drawImage(
      this.image,
      this.getScaleRateSize(absLeft),
      this.getScaleRateSize(absTop),
      this.getScaleRateSize(imgWidth),
      this.getScaleRateSize(imgHeight),
    );

    this.resultDrawCurrentCanvas();
  };

  handleShadows = (layer: Layer) => {
    if (!this.ctx) {
      return;
    }

    const { offsetX, offsetY, color } = layer;
    const { rgbObjToStr } = HandleImageEffects;
    const { absTop, absLeft, imgWidth, imgHeight } = this.size;

    this.ctx.drawImage(
      this.image,
      this.getScaleRateSize(absLeft + offsetX),
      this.getScaleRateSize(absTop + offsetY),
      this.getScaleRateSize(imgWidth),
      this.getScaleRateSize(imgHeight),
    );
    this.ctx.globalCompositeOperation = 'source-in';
    this.ctx.fillStyle = rgbObjToStr(color);
    this.ctx.fillRect(0, 0, this.canvas?.width ?? 0, this.canvas?.height ?? 0);

    this.resultDrawCurrentCanvas();
  };

  initCanvasCtx = () => {
    if (!this.ctx) {
      return;
    }
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0)'; // chrome 默认值
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.clearRect(0, 0, this.canvas?.width ?? 0, this.canvas?.height ?? 0);
  };

  handleLayers = () => {
    const { renderLayer } = this.size;

    renderLayer.forEach((layer: Layer) => {
      const { offsetX, offsetY, strokeWidth, blur } = layer;
      this.initCanvasCtx();

      if (strokeWidth > 0) {
        // 画描边
        this.handleStroke(layer);
      } else if (blur > 0) {
        this.handleBlur(layer);
      } else if (offsetX !== 0 || offsetY !== 0) {
        // 画投影
        this.handleShadows(layer);
      }
    });

    const { absTop, absLeft, imgWidth, imgHeight } = this.size;
    this.resultCtx?.drawImage(this.image, absLeft, absTop, imgWidth, imgHeight);
  };

  run = () => {
    this.handleLayers();
  };

  getInfo = () => {
    return {
      image: this.resultCanvas,
      size: this.size,
    };
  };
}
