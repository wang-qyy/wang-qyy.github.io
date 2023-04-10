export interface RulerHandlerOptions {
  height: number;
  background?: string;
  scaleColor: string;
  fontColor?: string;
  formatter?: (scale: number) => string;
  scaleWidth: number; // 刻度间隔距离
  width: number;
  offsetLeft: number; // 偏移距离，一般为容器的scrollLeft
  labelInterval: number; // label 间隔数
  lineWidth?: number;
  scaleHeight?: number;
  textAlign?: CanvasTextAlign;
  paddingLeft?: number; // TODO: 后面改为 padding
  fontOffsetY?: number; // 字体在y轴的偏移量
  fontOffsetX?: number; // 字体在x轴的偏移量
  textBaseline?: CanvasTextBaseline;
  fontSize?: string; // 刻度尺字体大小
}

export class RulerHandler {
  ctx: CanvasRenderingContext2D | null;

  el: HTMLCanvasElement;

  options: RulerHandlerOptions;

  devicePixelRatio: number;

  constructor(el: HTMLCanvasElement, options: RulerHandlerOptions) {
    this.el = el;
    this.options = options;
    this.ctx = el.getContext('2d');
    this.devicePixelRatio = window.devicePixelRatio || 1;
  }

  drawRuler = () => {
    if (this.ctx) {
      const {
        width = 0,
        height,
        background = 'rgba(255, 255, 255, 0)',
        scaleColor,
        scaleWidth = 1,
        scaleHeight = height,
        lineWidth = 1,
        fontColor = '#57575C',
        offsetLeft = 0,
        labelInterval,
        formatter = v => v,
        textAlign = 'left',
        paddingLeft = 0,
        fontOffsetY = height * 0.5,
        fontOffsetX = 0,
        textBaseline = 'alphabetic',
        fontSize = '14px Arial',
      } = this.options;

      this.el.style.width = `${width}px`;
      this.el.style.height = `${height}px`;
      this.el.width = width * this.devicePixelRatio;
      this.el.height = height * this.devicePixelRatio;
      this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);

      this.ctx.clearRect(0, 0, width, height);
      this.ctx.fillStyle = background;
      // 根据宽度和刻度计算出刻度点
      const scale = width / scaleWidth;

      // 第一个格子偏移距离
      const offset = offsetLeft % scaleWidth;
      // 尺标刻度偏移个数
      const offsetNum = ~~(offsetLeft / scaleWidth);

      for (let i = 0; i < scale; i++) {
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.strokeStyle = scaleColor;
        this.ctx.lineWidth = lineWidth; // 改配置
        this.ctx.lineCap = 'round';
        const startScale = scaleWidth * i - offset + paddingLeft;
        this.ctx.moveTo(startScale, 0);

        if ((i + offsetNum) % labelInterval === 0) {
          this.ctx.lineTo(startScale, scaleHeight);
          const text = formatter(i + offsetNum);
          this.ctx.font = fontSize;
          this.ctx.fillStyle = fontColor;
          this.ctx.textBaseline = textBaseline;
          this.ctx.textAlign = textAlign;
          this.ctx.fillText(
            text.toString(),
            startScale + fontOffsetX,
            fontOffsetY,
          );
        } else {
          this.ctx.lineTo(startScale, Math.floor(scaleHeight * 0.5));
        }

        this.ctx.stroke();
        this.ctx.restore();
        this.ctx.closePath();
      }
    }
  };

  updateOptions = (options: Partial<RulerHandlerOptions>) => {
    Object.assign(this.options, options);
    this.drawRuler();
  };

  updateOption = (options: Partial<RulerHandlerOptions>) => {
    this.options = { ...this.options, ...options };
    this.drawRuler();
  };
}
