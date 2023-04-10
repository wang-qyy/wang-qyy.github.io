import { Filters } from '@/kernel/typing';
import { defaultFilters } from '@/kernel/utils/const';
import fabric from 'fabric';
// import type { Asset, Filters, RGBA, ImageEffects } from '@kernel/typing';

export interface HandleFilterOpts {
  node: HTMLCanvasElement;
  width: number;
  height: number;
  src: string;
  filters?: Partial<Filters>;
}

export class HandleFilter {
  canvas: fabric.StaticCanvas;

  context: CanvasRenderingContext2D;

  width: number;

  height: number;

  src: string;

  filters: Partial<Filters> | undefined;

  image: fabric.Image | undefined;

  constructor(opts: HandleFilterOpts) {
    const { node, width, height, src, filters } = opts;
    this.width = width;
    this.height = height;
    this.height = height;
    this.src = src;
    this.filters = filters;
    this.canvas = new fabric.StaticCanvas(node, {
      selection: false,
      enableRetinaScaling: false,
    });
    this.context = this.canvas.getContext();
    // fabric.filterBackend = new fabric.Canvas2dFilterBackend();
    // 如果支持 webgl 则使用 webgl 渲染
    fabric.filterBackend = fabric.initFilterBackend();
    fabric.Object.prototype.transparentCorners = false;
    this._initImage();
  }

  // 参考图怪兽逻辑
  // 过滤掉默认值
  _formatFilters = () => {
    const filters = [];
    const formattedFilters: Record<string, number> = {};
    Object.entries(this.filters || {}).forEach(([key, val]) => {
      formattedFilters[key] = window.parseFloat(`${val}`);
    });

    const strong = formattedFilters?.strong ?? 1;

    ['brightness', 'saturate', 'hue', 'contrast', 'blur'].forEach(k => {
      const key = k as keyof Filters;
      const defaultVal = defaultFilters[key];
      const currentVal = formattedFilters![key];
      if (currentVal !== undefined && currentVal !== defaultVal) {
        filters.push({ key, value: currentVal * strong });
      }
    });

    const gamma = [
      formattedFilters?.['gamma-r'] === undefined
        ? 1
        : (formattedFilters['gamma-r'] - 1) * strong + 1,
      formattedFilters?.['gamma-g'] === undefined
        ? 1
        : (formattedFilters['gamma-g'] - 1) * strong + 1,
      formattedFilters?.['gamma-b'] === undefined
        ? 1
        : (formattedFilters['gamma-b'] - 1) * strong + 1,
    ];
    if (gamma.some(t => t !== 1)) {
      filters.push({ key: 'gamma', value: gamma });
    }

    // 锐化
    if (formattedFilters?.sharpen) {
      const sharpen = formattedFilters?.sharpen * strong;
      const centerValue = 1 + sharpen;
      const boundaryValue = -(0 + sharpen / 8);

      filters.push({
        key: 'sharpen',
        value: [
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
      });
    }
    return filters;
  };

  _putFilters = (filterType: string, filterValue: any) => {
    switch (filterType) {
      case 'brightness': // 亮度
        this.image?.filters?.push(
          new fabric.Image.filters.Brightness({
            brightness: filterValue,
          }),
        );
        break;
      case 'gamma': // 色温 / 色调
        this.image?.filters?.push(
          new fabric.Image.filters.Gamma({
            gamma: filterValue,
          }),
        );
        break;
      case 'saturate': // 饱和度
        this.image?.filters?.push(
          new fabric.Image.filters.Saturation({
            saturation: filterValue,
          }),
        );
        break;
      case 'contrast': // 对比度
        this.image?.filters?.push(
          new fabric.Image.filters.Contrast({
            contrast: filterValue,
          }),
        );
        break;
      case 'hue': // 偏色
        this.image?.filters?.push(
          new fabric.Image.filters.HueRotation({
            rotation: filterValue,
          }),
        );
        break;
      case 'blur': // 模糊
        this.image?.filters?.push(
          new fabric.Image.filters.Blur({
            blur: filterValue,
          }),
        );
        break;
      case 'sharpen': // 锐化
        this.image?.filters?.push(
          new fabric.Image.filters.Convolute({
            matrix: [...filterValue],
          }),
        );
        break;
      default:
        break;
    }
  };

  _setFilters = (filters?: Partial<Filters>) => {
    if (filters) this.filters = filters;
    if (!this.filters || !this.image) return;
    const filterList = this._formatFilters();
    this.image.filters = [];
    // TODO: 预设
    // filterList.forEach(({ key, value }) => this._putFilters(key, value));

    filterList.forEach(({ key, value }) => this._putFilters(key, value));
    this.image.applyFilters();
  };

  updateFilters = (filters: Partial<Filters>) => {
    this._setFilters(filters);
    this.render();
  };

  setSize = () => {
    this.image?.set({
      scaleX: this.width / (this.image.width ?? 1),
      scaleY: this.height / (this.image.height ?? 1),
      selectable: false,
    });

    this.canvas.setDimensions({
      width: this.width,
      height: this.height,
    });
  };

  _initImage = (src?: string) => {
    fabric.Image.fromURL(
      src || this.src,
      image => {
        const ele = this.canvas.getElement();
        // 在切换画布时候(比如专业版切到极速版)，会导致Element元素丢失
        if (!ele) return;

        this.image = image;

        this.image.set({
          shadow: 'rgba(0,0,0,0.2) 2px 2px 10px',
        });

        this._setFilters();
        this.setSize();
        this.canvas.add(image);
        this.render();
      },
      {
        crossOrigin: 'anonymous',
        left: 0,
        top: 0,
      },
    );
  };

  _asyncSetSrc = (src: string) => {
    return new Promise((res, rej) => {
      if (!this.image) {
        console.error('this.image is undefined');
        return rej(new Error('this.image is undefined'));
      }

      this.image?.setSrc(
        src,
        () => {
          res(true);
        },
        {
          crossOrigin: 'anonymous',
          left: 0,
          top: 0,
        },
      );
    });
  };

  updateImage = async (width: number, height: number, src: string) => {
    this.width = width;
    this.height = height;

    if (!this.image) {
      this.src = src;
      this._initImage(src);
      return;
    }
    // this.image.filters = [];
    // this.image.applyFilters();
    this.width = width;
    this.height = height;

    if (src !== this.src) {
      this.src = src;
      await this._asyncSetSrc(src);
      this._setFilters();
    }

    this.setSize();
    this.render();
  };

  render = () => {
    this.canvas?.requestRenderAll();
  };

  dispose = () => {
    this.canvas?.dispose();
  };
}
