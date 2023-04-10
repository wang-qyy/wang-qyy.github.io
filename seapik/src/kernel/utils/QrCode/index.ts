import { GradientColor, RGBA } from '@/kernel';
import { RGBAToString } from '@/kernel/utils/single';
import { vec2 } from 'gl-matrix';
import LRUCache from 'lru-cache';
import QRCodeAlg from './qrcodealg';
import { checkPdGround, loadImage } from './utils';

const qrCodeAlgObjCache = new LRUCache<string, QRCodeAlg>({
  max: 50,
});

export interface QrCodeOpt {
  text: string;
  size: number;
  correctLevel: number;
  background: RGBA; // 背景色
  foreground: RGBA | GradientColor; // 前景色 支持渐变
  image: string;
  imageSize: number;
  pdGround?: RGBA; // 三个角的颜色
  padding: number;
  canvas?: HTMLCanvasElement;
}

class QrCode {
  options: QrCodeOpt = {
    text: '',
    size: 300,
    padding: 20,
    correctLevel: 3,
    background: { r: 255, g: 255, b: 255 },
    foreground: { r: 0, g: 0, b: 0 },
    image: '',
    imageSize: 50,
  };

  canvas: HTMLCanvasElement;

  ctx: CanvasRenderingContext2D | null;

  imgCanvas: HTMLCanvasElement | null;

  imgCtx: CanvasRenderingContext2D | null;

  bGImgCanvas: HTMLCanvasElement | null;

  bGImgCtx: CanvasRenderingContext2D | null;

  devicePixelRatio: number;

  constructor(opts: Partial<QrCodeOpt>) {
    // 设置默认参数
    this.options = Object.assign(this.options, opts);
    this.devicePixelRatio = window.devicePixelRatio || 1;
    this.canvas = this.options.canvas || document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.imgCanvas = null;
    this.imgCtx = null;
    this.bGImgCanvas = null;
    this.bGImgCtx = null;

    this.setCanvasSize();
  }

  setCanvasSize = () => {
    const { size } = this.options;
    const ratio = this.devicePixelRatio;
    this.canvas.width = size * ratio;
    this.canvas.height = size * ratio;
    this.ctx?.scale(ratio, ratio);
  };

  _InitImageSize = () => {
    const { imageSize, image } = this.options;

    if (!this.imgCanvas && image) {
      this.imgCanvas = document.createElement('canvas');
      this.imgCtx = this.imgCanvas.getContext('2d');

      this.imgCanvas.width = imageSize;
      this.imgCanvas.height = imageSize;
      this.imgCanvas.style.width = `${imageSize}px`;
      this.imgCanvas.style.height = `${imageSize}px`;
    }
  };

  // 在 imaCanvas 上绘制二维码中间图片
  _createImage = async () => {
    const { image, imageSize } = this.options;
    this._InitImageSize();
    if (!image) return;
    const imgEle = await loadImage(image);
    this.imgCtx?.drawImage(imgEle, 0, 0, imageSize, imageSize);
  };

  // 将 imaCanvas 绘制到二维码上
  _drawImage = () => {
    const { imageSize, size, image } = this.options;
    const x = ((size - imageSize) / 2).toFixed(2);
    const y = ((size - imageSize) / 2).toFixed(2);

    this.imgCanvas &&
      image &&
      this.ctx?.drawImage(
        this.imgCanvas,
        Number(x),
        Number(y),
        imageSize,
        imageSize,
      );
  };

  // 使用QRCodeAlg创建二维码结构，并缓存其对象
  _getQrCodeAlg = () => {
    const key = `${this.options.text}${this.options.correctLevel}`;
    let qrCodeAlg = qrCodeAlgObjCache.get(key);
    if (!qrCodeAlg) {
      qrCodeAlg = new QRCodeAlg(this.options.text, this.options.correctLevel);
      qrCodeAlgObjCache.set(key, qrCodeAlg);
    }
    return qrCodeAlg;
  };

  _drawBG = () => {
    const { options, ctx } = this;
    const { size, background } = options;
    if (!ctx) return;

    // 背景色
    const BGColor = RGBAToString(background);

    ctx.save();
    ctx.fillStyle = BGColor;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  };

  _getLineargradient = (
    ctx: CanvasRenderingContext2D,
    size: number,
    gradient: GradientColor,
  ) => {
    const center: vec2 = [size / 2, size / 2];
    const start: vec2 = [size / 2, size];
    const end: vec2 = [size / 2, 0];
    const angle = 90 - gradient.angle;
    vec2.rotate(start, start, center, angle * (Math.PI / 180));
    vec2.rotate(end, end, center, angle * (Math.PI / 180));

    const lineargradient = ctx.createLinearGradient(
      start[0],
      start[1],
      end[0],
      end[1],
    );
    gradient.colorStops.forEach(({ offset, color }) => {
      lineargradient.addColorStop(offset, RGBAToString(color));
    });
    return lineargradient;
  };

  // _getBGImg = async () => {
  //   const { size } = this.options;
  //   const imgEle = await loadImage(
  //     'https://static.chuangkit.com/tools/pc-design/prod/7eb9c2912c975fdde6a0.png',
  //   );

  //   this.bGImgCanvas.width = size;
  //   this.bGImgCanvas.height = size;
  //   this.bGImgCanvas.style.width = `${size}px`;
  //   this.bGImgCanvas.style.height = `${size}px`;
  //   this.bGImgCtx?.drawImage(imgEle, 0, 0, size, size);
  // };

  _drawQrCode = () => {
    const { options, ctx } = this;
    if (!ctx) return;

    const { size, pdGround, foreground, padding } = options;

    ctx.clearRect(0, 0, size, size);

    // 绘制背景
    this._drawBG();

    // 使用QRCodeAlg创建二维码结构
    const qrCodeAlg = this._getQrCodeAlg();
    const count = qrCodeAlg.getModuleCount();

    // 减去 padding 后的实际绘制尺寸
    const CSize = size - padding * 2;

    // 前景色
    let FGColor;
    if ((foreground as GradientColor).colorStops) {
      FGColor = this._getLineargradient(
        ctx,
        CSize,
        foreground as GradientColor,
      );
    } else {
      FGColor = RGBAToString(foreground as RGBA);
    }
    const PDColor = pdGround && RGBAToString(pdGround);

    // 计算每个点的长宽
    const tileW = Number((CSize / count).toPrecision(4));
    const tileH = Number((CSize / count).toPrecision(4));

    // 绘制
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        const w = Math.ceil((col + 1) * tileW) - Math.floor(col * tileW);
        const h = Math.ceil((row + 1) * tileW) - Math.floor(row * tileW);
        // 角颜色或者前景色

        // 前景
        if (qrCodeAlg.modules[row][col]) {
          const isPdGround = checkPdGround({
            row,
            col,
            count,
            options,
          });
          // 边角
          if (isPdGround && PDColor) {
            ctx.fillStyle = PDColor;
          } else {
            ctx.fillStyle = FGColor;
          }

          // ctx.drawImage(
          //   this.bGImgCanvas,
          //   Math.round(col * tileW + padding),
          //   Math.round(row * tileH + padding),
          //   w,
          //   h,
          //   Math.round(col * tileW + padding),
          //   Math.round(row * tileH + padding),
          //   w,
          //   h,
          // );
          ctx.fillRect(
            Math.round(col * tileW + padding),
            Math.round(row * tileH + padding),
            w,
            h,
          );
        }
      }
    }
  };

  upDateImage = async (src: string) => {
    this.options.image = src;
    await this._createImage();
    this._drawImage();
  };

  updateText = async (text: string) => {
    this.options.text = text;
    this._drawQrCode();
    this._drawImage();
  };

  upDateOptions = async (opts: Partial<QrCodeOpt>) => {
    const prevImg = this.options.image;
    Object.assign(this.options, opts);

    if (prevImg !== this.options.image) {
      await this._createImage();
    }

    this._drawQrCode();
    this._drawImage();
  };

  create = async () => {
    // await this._getBGImg();
    await this._createImage();
    this._drawQrCode();
    this._drawImage();
    return this.canvas;
  };
}

export default QrCode;
