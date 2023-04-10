import {
  getCanvasInfo,
  getCurrentTemplate,
  GradientType,
  RGBA,
} from '@/kernel';
import { getAssetsOnCurrentTime } from '@/kernel/store';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { assetIdPrefix } from '@/kernel/utils/const';
import { sortBy } from 'lodash-es';
import { vec2 } from 'gl-matrix';
import { angleCanvasToDom, RGBAToString } from '@/kernel/utils/single';

class FontColorChecker {
  canvas: HTMLCanvasElement | undefined;

  ctx: CanvasRenderingContext2D | undefined;

  devicePixelRatio = window.devicePixelRatio || 1;

  // 获取点后面的第一个元素
  _getAsset = (points: number[][]) => {
    const assets = sortBy(getAssetsOnCurrentTime(), o => -o.transform.zindex);

    const list: AssetItemState[] = [];
    points.forEach(([x, y]) => {
      const coincident = assets.find(asset => {
        const {
          attribute: { width, height },
          transform: { posX, posY },
        } = asset;

        return (
          x >= posX && x <= posX + width && y >= posY && y <= posY + height
        );
      });
      if (coincident) list.push(coincident);
    });

    return list;
  };

  _initCanvas = () => {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d') || undefined;
    }
    const { width, height } = getCanvasInfo();
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.width = width * this.devicePixelRatio;
    this.canvas.height = height * this.devicePixelRatio;
    this.ctx?.scale(this.devicePixelRatio, this.devicePixelRatio);
  };

  // 获取文字区域三个点的位置
  _getPoints = (opt: {
    fontWidth: number;
    fontHeight: number;
    posX: number;
    posY: number;
  }) => {
    const { fontWidth, fontHeight, posX, posY } = opt;
    const y = posY + fontHeight / 2;
    return [
      [posX + fontWidth * 0.2, y],
      [posX + fontWidth * 0.5, y],
      [posX + fontWidth * 0.8, y],
    ];
  };

  // 将 svgEle 转为base64
  _getSvgEle = async (svg: Node) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      try {
        const xml = new XMLSerializer().serializeToString(svg);

        // 这种方式如果svg中包含中文会报错
        // const svg64 = btoa(xml);
        // const image64 = `data:image/svg+xml;base64,${svg64}`;

        const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const img = document.createElement('img');

        img.src = url;
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = error => {
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  };

  _drawAssets = async (assets: AssetItemState[]) => {
    const content = document.querySelector('#HC-CORE-EDITOR-CANVAS');
    if (!content) return;

    // 先绘制低层级的
    const assetList = sortBy(assets, o => o.transform.zindex);

    for (let index = 0; index < assetList.length; index++) {
      const asset = assetList[index];
      const {
        attribute: { width, height },
        transform: { posX, posY },
        meta: { type },
      } = asset;

      // 获取该元素的dom元素
      const imgEle = content.querySelector(
        `[data-asset-id=${assetIdPrefix}${asset.id}]`,
      ) as HTMLImageElement | HTMLVideoElement;

      if (imgEle) {
        let image = imgEle;
        let sx = 0;
        let sy = 0;
        const dx = posX;
        const dy = posY;
        const dWidth = width;
        const dHeight = height;

        // 如果是 VIDEO | IMG, 裁剪值需要根据缩放值来计算
        let scaleX = 1;
        let scaleY = 1;

        switch (imgEle.tagName) {
          case 'svg':
            // 如果是svg类型，需要先把svg转为base64，canvas不支持直接传入svg ele
            // eslint-disable-next-line
            image = await this._getSvgEle(imgEle);
            break;
          case 'DIV': {
            if (type === 'lottie') {
              const lottieEle = imgEle.firstChild;
              if (lottieEle) {
                // eslint-disable-next-line
                image = await this._getSvgEle(lottieEle);
              }
            }
            break;
          }
          case 'VIDEO':
            scaleX = (imgEle as HTMLVideoElement).videoWidth / width;
            scaleY = (imgEle as HTMLVideoElement).videoHeight / height;
            break;
          case 'IMG':
            scaleX = (imgEle as HTMLImageElement).naturalWidth / width;
            scaleY = (imgEle as HTMLImageElement).naturalHeight / height;
            break;
          default:
            break;
        }

        const sWidth = width * scaleX;
        const sHeight = height * scaleY;

        // mask类型需要计算裁剪值
        if (type === 'mask' && assets[0]) {
          const rel = assets[0];
          sx = -rel.transform.posX * scaleX;
          sy = -rel.transform.posY * scaleX;
        }

        this.ctx?.drawImage(
          image,
          sx,
          sy,
          sWidth,
          sHeight,
          dx,
          dy,
          dWidth,
          dHeight,
        );
      }
    }
    // document.body.appendChild(this.canvas);
  };

  // 判断某个点颜色深色/浅色
  _getPixelColor = (x: number, y: number) => {
    if (!this.ctx) return 0;
    const imageData = this.ctx.getImageData(x, y, 1, 1);
    const pixel = imageData.data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    const val = r * 0.299 + g * 0.587 + b * 0.114;
    if (val >= 192) {
      // console.log('浅色', `rgb(${r},${g},${b})`);
      return 1;
    }
    // console.log('深色', `rgb(${r},${g},${b})`);
    return 0;
  };

  // 绘制背景图层
  _drawBg = () => {
    const currentTemplate = getCurrentTemplate();
    if (!currentTemplate || !this.ctx) return;
    if (currentTemplate.pageAttr.backgroundImage) return;
    const bGColor = currentTemplate.pageAttr.backgroundColor;
    if (!bGColor) return;

    const width = this.canvas?.width || 0;
    const height = this.canvas?.height || 0;

    this.ctx?.clearRect(0, 0, width, height);

    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, width, height);

    if ((bGColor as GradientType).colorStops) {
      const center: vec2 = [width / 2, height / 2];
      const start: vec2 = [width / 2, height];
      const end: vec2 = [width / 2, 0];
      const angle = angleCanvasToDom((bGColor as GradientType).angle);
      vec2.rotate(start, start, center, angle * (Math.PI / 180));
      vec2.rotate(end, end, center, angle * (Math.PI / 180));

      // const lineargradient = this.ctx.createLinearGradient(0, height / 2, 0, 0);
      const lineargradient = this.ctx.createLinearGradient(
        start[0],
        start[1],
        end[0],
        end[1],
      );
      (bGColor as GradientType).colorStops.forEach(({ offset, color }) => {
        lineargradient.addColorStop(offset, RGBAToString(color));
      });
      this.ctx.fillStyle = lineargradient;
    } else {
      this.ctx.fillStyle = RGBAToString(bGColor as RGBA);
    }
    this.ctx.fillRect(0, 0, width, height);
  };

  checkLightColor = async (opt: {
    fontWidth: number;
    fontHeight: number;
    posX: number;
    posY: number;
  }) => {
    this._initCanvas();
    const points = this._getPoints(opt);
    const assets = this._getAsset(points);
    this._drawBg();
    await this._drawAssets(assets);
    const sum = points.reduce((count, [x, y]) => {
      const c = this._getPixelColor(x, y);
      return count + c;
    }, 0);
    // 当一半以上是浅色返回true
    return sum > points.length / 2;
  };
}

const fontColorChecker = new FontColorChecker();

export default fontColorChecker;
