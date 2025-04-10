import { createRef } from "react";
import { observable, makeObservable, action } from "mobx";

import { renderImageWithAngle, canvasToFile } from "./utils";

export type DrawType = "curve" | "line" | "eraser";

class ImageHandler {
  botRef = createRef<HTMLCanvasElement>();
  topRef = createRef<HTMLCanvasElement>();
  //底层canvas
  botCan!: HTMLCanvasElement;
  //顶层canvas
  topCan!: HTMLCanvasElement;
  //底层画布
  private botCtx!: CanvasRenderingContext2D;
  //顶层画布
  private topCtx!: CanvasRenderingContext2D;
  private canvasWidth!: number;
  private canvasHeight!: number;

  //鼠标是否按下  是否移动
  @observable
  isDown = false;
  private isMove = false;
  //鼠标是否在canvas上抬起
  private isCanUp = false;
  //需要画图的轨迹
  private drawPoints: { x: number; y: number }[] = [];
  //起始点x,y
  private startPoint = {
    x: 0,
    y: 0,
  };
  //图片历史
  @observable
  imgHistory: HTMLImageElement[] = [];
  //icon历史
  // let partHistory = [];
  //操作类型

  @observable
  drawType: DrawType = "curve";

  @observable //画线宽度
  lineWidth: number = 20;

  @observable
  brushColor: string = "rgba(255,255,255,1)";

  initImageData?: ImageData;

  isEdit: boolean = false;
  constructor() {}

  init() {
    this.topCan = this.topRef.current;
    this.botCan = this.botRef.current;

    this.topCtx = this.topCan?.getContext("2d") as CanvasRenderingContext2D;
    this.botCtx = this.botCan?.getContext("2d") as CanvasRenderingContext2D;
    this.canvasHeight = this.topCan?.height;
    this.canvasWidth = this.topCan?.width;
    this.topCtx.lineCap = "round";
    this.topCtx.lineJoin = "round";
    this.addEventListener();
  }

  addEventListener = () => {
    //canvas添加鼠标事件
    this.topCan.addEventListener("mousedown", this.mousedown);
    this.topCan.addEventListener("mousemove", this.mousemove);
    this.topCan.addEventListener("mouseup", this.mouseup);
    //全局添加鼠标抬起事件
    document.addEventListener("mouseup", (e) => {
      let x = (e || window.event).offsetX;
      let y = (e || window.event).offsetY;
      if (!this.isCanUp) {
        if (this.drawType == "line") {
          let clientX = this.topCan.getBoundingClientRect().x;
          let clientY = this.topCan.getBoundingClientRect().y;
          this.drawLine(x - clientX, y - clientY);
        }
        // topCan内容画到botCan上
        this.topToBot();
      }
    });
    //全局添加鼠标移动事件
    document.addEventListener("mousemove", (e) => {
      if (this.isMove) return (this.isMove = false);
      let x = (e || window.event).offsetX;
      let y = (e || window.event).offsetY;
      if (this.drawType == "line") {
        let clientX = this.topCan.getBoundingClientRect().x;
        let clientY = this.topCan.getBoundingClientRect().y;
        this.drawLine(x - clientX, y - clientY);
      }
    });
  };

  drawImage = (info: {}) => {
    renderImageWithAngle(this.botCan, info);
  };

  reset = () => {
    if (this.initImageData) {
      this.isEdit = false;
      this.botCtx.putImageData(this.initImageData, 0, 0);
    }
  };

  toFile = () => {
    return new Promise((resolve, reject) => {
      this.botCan.toBlob((blob) => {
        resolve(blob);
      });
    });
  };
  toDataURL = () => {
    return this.botRef.current?.toDataURL("image/png");
  };

  //鼠标按下
  private mousedown = (e: MouseEvent) => {
    this.isDown = true;
    let x = (e || window.event).offsetX;
    let y = (e || window.event).offsetY;
    this.startPoint = { x, y };
    this.drawPoints.push({ x, y });
    this.topCtx.strokeStyle = this.brushColor;
    this.topCtx.lineWidth = this.lineWidth;
    this.topCtx.beginPath();
    this.topCtx.moveTo(x, y);
  };
  //鼠标移动
  private mousemove = (e: MouseEvent) => {
    let x = (e || window.event).offsetX;
    let y = (e || window.event).offsetY;
    if (this.isDown) {
      this.isMove = true;
      switch (this.drawType) {
        case "curve":
          this.drawCurve(x, y);
          break;
        case "line":
          this.drawLine(x, y);
          break;
        case "eraser":
          this.drawEraser(x, y);
          break;
      }
    }
  };
  //鼠标抬起
  private mouseup = (e: MouseEvent) => {
    this.isCanUp = true;
    if (this.isDown) {
      // topCan内容画到botCan上
      this.topToBot();
    }
  };
  //topCan内容画到botCan上
  private topToBot = () => {
    //把topCan画布生成图片
    let img = new Image();
    img.src = this.topCan.toDataURL("image/png");
    img.onload = () => {
      //添加到botCtx画布

      /**
       * https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
       * 将重合部分置为透明
       * */
      this.botCtx.globalCompositeOperation = "destination-out";

      this.botCtx.drawImage(img, 0, 0);

      let historyImg = new Image();
      historyImg.src = this.botCan.toDataURL("image/png");

      historyImg.onload = () => {
        // 添加到历史记录
        this.imgHistory.push(historyImg);

        document.body.appendChild(historyImg);
      };

      // this.getArea();

      // 清除topCtx画布
      this.topCtx.clearRect(0, 0, this.topCan.width, this.topCan.height);
      // botCan画完之后，重置canvas的mouseup isCanUp
      if (this.isCanUp) this.isCanUp = false;
    };

    this.drawPoints = [];

    this.isDown = false;
    this.isMove = false;
  };

  // 获取涂抹的点位
  private getArea = () => {
    const imgData = this.getColors(this.topCtx);

    const a = this.getColors(this.botCtx);

    const greenColor = [255, 0, 0, 0];
    const clickColor = [255, 0, 0, 128];
    const stack = [{ ...this.startPoint }];

    while (stack.length > 0) {
      const { x, y } = stack.pop();

      if (x < 0 || x >= this.topCan.width || y < 0 || y >= this.topCan.height) {
        continue;
      }

      const i = this.point2Index(x, y);
      const color = this.getColor(x, y, imgData);

      if (
        this.diff(color, clickColor) <= 100 &&
        this.diff(color, greenColor) !== 0
      ) {
        imgData.data.set([0, 0, 0, 255], i);
        a.data.set([0, 0, 0, 0], i);

        stack.push({ x: x + 1, y });

        stack.push({ x: x - 1, y });

        stack.push({ x, y: y + 1 });

        stack.push({ x, y: y - 1 });
      }
    }

    this.botCtx.putImageData(a, 0, 0);
  };

  private getColors = (ctx: CanvasRenderingContext2D) => {
    return ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
  };
  //橡皮擦
  private drawEraser = (x: number, y: number) => {
    //橡皮擦圆形半径
    const radius = this.lineWidth / 2;
    this.botCtx.beginPath();
    for (let i = 0; i < radius * 2; i++) {
      //勾股定理高h
      let h = Math.abs(radius - i); //i>radius h = i-radius; i<radius  h = radius - i
      //勾股定理l
      let l = Math.sqrt(radius * radius - h * h);
      //矩形高度
      let rectHeight = 1;
      //矩形宽度
      let rectWidth = 2 * l;
      //矩形X
      let rectX = x - l;
      //矩形Y
      let rectY = y - radius + i;

      this.botCtx.clearRect(rectX, rectY, rectWidth, rectHeight);
    }
  };
  //画透明度直线
  private drawLine = (x: number, y: number) => {
    if (!this.isDown) return;
    //清空当前画布内容
    this.topCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    //必须每次都beginPath  不然会卡
    this.topCtx.beginPath();
    this.topCtx.moveTo(this.startPoint.x, this.startPoint.y);
    this.topCtx.lineTo(x, y);
    this.topCtx.stroke();
  };
  //画带透明度涂鸦
  drawCurve = (x: number, y: number) => {
    this.drawPoints.push({ x, y });
    //清空当前画布内容
    this.topCtx.clearRect(0, 0, this.topCan.width, this.topCan.height);
    //必须每次都beginPath  不然会卡
    this.topCtx.beginPath();
    this.topCtx.moveTo(this.drawPoints[0].x, this.drawPoints[0].y);
    for (let i = 1; i < this.drawPoints.length; i++) {
      this.topCtx.lineTo(this.drawPoints[i].x, this.drawPoints[i].y);
    }
    this.topCtx.stroke();
  };

  private point2Index(x: number, y: number) {
    return (y * this.canvasWidth + x) * 4;
  }
  private getColor(x: number, y: number, imageData: ImageData) {
    const i = this.point2Index(x, y);
    return [
      imageData.data[i],
      imageData.data[i + 1],
      imageData.data[i + 2],
      imageData.data[i + 3],
    ];
  }
  private diff(color1: number[], color2: number[]) {
    const res =
      Math.abs(color1[0] - color2[0]) +
      Math.abs(color1[1] - color2[1]) +
      Math.abs(color1[2] - color2[2]) +
      Math.abs(color1[3] - color2[3]);
    return res;
  }

  changeLineWidth(width: number) {
    this.lineWidth = width;
  }
  //切换操作
  changeType = (type: DrawType) => {
    if (this.drawType == type) return;
    this.drawType = type;
  };

  clear() {
    this.topCtx.clearRect(0, 0, this.topCan.width, this.topCan.height);
    this.botCtx.clearRect(0, 0, this.botCan.width, this.botCan.height);
  }
}

const ImageHandlerStore = new ImageHandler();

export type ImageHandlerClass = ImageHandler;

export default ImageHandlerStore;
