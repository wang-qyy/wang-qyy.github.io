import { Canvas, FabricObject, Group, Textbox } from "fabric";

// 创建弯曲文本
export function createCurvedText(props: any, textManager: CurvedTextExtension) {
  const { text, curveType, ...others } = props;

  const options = {
    ...others,
    fontFamily: "Arial",
    left: 400,
    top: 300,
  };

  // 根据曲线类型添加额外选项
  switch (curveType) {
    case "arc":
      textManager.createArcText(text, options);
      break;

    case "circle":
      options.clockwise = true;
      textManager.createCircleText(text, options);
      break;

    case "wave":
      options.left = 200;
      textManager.createWaveText(text, options);
      break;

    case "spiral":
      textManager.createSpiralText(text, options);
      break;
  }
}

// 更新选中的文本
export function updateSelectedText(
  activeObject: Group,
  props: any,
  handler: CurvedTextExtension
) {
  if (!activeObject || !activeObject.curvedType) {
    alert("请先选择要更新的弯曲文本");
    return;
  }
  const {
    text: newText,
    startAngle,
    endAngle,

    frequency,
    phase,
    angleIncrement,
    curveType,
    ...others
  } = props;

  const options = {
    ...others,
    curveType,
  };

  // 根据曲线类型添加额外选项
  switch (curveType) {
    case "arc":
      options.startAngle = (parseInt(startAngle) * Math.PI) / 180;
      options.endAngle = (parseInt(endAngle) * Math.PI) / 180;
      break;

    case "circle":
      options.startAngle = (parseInt(startAngle) * Math.PI) / 180;
      break;

    case "wave":
      options.frequency = parseInt(frequency) / 100;
      options.phase = parseInt(phase) / 100;
      break;

    case "spiral":
      options.angleIncrement = parseInt(angleIncrement) / 100;
      break;
  }

  handler.updateCurvedText(activeObject, newText, options);
}

// 应用预设
export function applyPreset(preset: string) {
  switch (preset) {
    case "gentle":
      return {
        curveType: "arc",
        radius: 200,
        startAngle: -Math.PI,
        endAngle: 0,
        arcPadding: 0,
      };

    case "strong":
      return {
        curveType: "arc",
        radius: 80,
        startAngle: -Math.PI,
        endAngle: 0,
        arcPadding: 10,
      };

    case "fullCircle":
      return {
        curveType: "circle",
        radius: 100,
        circleStartAngle: 0,
        circleSpacing: 1.0,
      };

    case "sineWave":
      return {
        curveType: "wave",
        waveAmplitude: 30,
        waveFrequency: 5,
        wavePhase: 0,
      };

    case "spiralIn":
      return {
        curveType: "spiral",
        startRadius: 80,
        spiralRadiusIncrement: 5,
        spiralAngleIncrement: 30,
      };

    case "spiralOut":
      return {
        curveType: "spiral",
        startRadius: 20,
        spiralRadiusIncrement: 15,
        spiralAngleIncrement: 20,
      };
  }
}

// 导出为JSON
export function exportJSON(canvas: Canvas) {
  const data = canvas.toJSON();

  console.log(data);
  return;

  const jsonString = JSON.stringify(data, null, 2);

  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "curved-text-design.json";
  a.click();
  URL.revokeObjectURL(url);
}

// 导入JSON
export function importJSON(canvas: Canvas) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        canvas.loadFromJSON(data, function () {
          canvas.renderAll();
        });
      } catch (error) {
        alert("导入失败：" + error.message);
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

// 清空画布
export function clearCanvas(canvas: Canvas) {
  canvas.clear();
  canvas.backgroundColor = "#fff";
  canvas.renderAll();
}

// Fabric.js 6.0+ 弯曲文本扩展
export class CurvedTextExtension {
  canvas: Canvas;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  addToGroup(objs: (Textbox | FabricObject)[], options: any) {
    return new Group(objs, {
      originX: "center",
      originY: "center",
      hasControls: true,
      hasBorders: true,
      ...options,
    });
  }

  // 创建弧形文本
  createArcText(text: string, options: any = {}) {
    const {
      radius = 100,
      startAngle = 0,
      endAngle = Math.PI,
      left = 300,
      top = 200,
      padding = 0,
    } = options;

    const chars = text.split("");

    const charObjects = this._createArcChars(chars, options);

    const group = this.addToGroup(charObjects, {
      left,
      top,
      curvedType: "arc",
      curvedOptions: { radius, startAngle, endAngle, padding },
    });

    this.canvas.add(group);
    this.canvas.requestRenderAll();

    return group;
  }

  // 创建圆形文本
  createCircleText(text: string, options: any = {}) {
    const {
      radius = 100,
      left = 300,
      top = 200,
      startAngle = 0,
      clockwise = true,
      spacing = 1.0,
    } = options;

    const chars = text.split("");

    const charObjects = this._createCircleChars(chars, options);

    const group = this.addToGroup(charObjects, {
      left,
      top,
      curvedType: "circle",
      curvedOptions: { radius, startAngle, clockwise, spacing },
    });

    this.canvas.add(group);
    this.canvas.requestRenderAll();

    return group;
  }

  // 创建波浪文本
  createWaveText(text: string, options: any = {}) {
    const {
      amplitude = 20,
      frequency = 0.05,
      left = 100,
      top = 200,
      phase = 0,
    } = options;

    const chars = text.split("");

    const charObjects = this._createWaveChars(chars, options);

    const group = this.addToGroup(charObjects, {
      left,
      top,
      curvedType: "wave",
      curvedOptions: { amplitude, frequency, phase },
    });

    this.canvas.add(group);
    this.canvas.requestRenderAll();
    return group;
  }

  // 创建螺旋文本
  createSpiralText(text: string, options: any = {}) {
    const {
      startRadius = 50,
      radiusIncrement = 10,
      angleIncrement = 0.3,
      left = 300,
      top = 200,
      ...others
    } = options;

    const chars = text.split("");

    const charObjects = chars.map((char, i) => {
      const radius = startRadius + i * radiusIncrement;
      const angle = i * angleIncrement;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      return new Textbox(char, {
        left: x,
        top: y,
        angle: ((angle + Math.PI / 2) * 180) / Math.PI,
        originX: "center",
        originY: "center",
        ...others,
      });
    });
    const group = this.addToGroup(charObjects, {
      left,
      top,
    });

    this.canvas.add(group);
    this.canvas.requestRenderAll();
    return group;
  }

  // 更新弯曲文本
  updateCurvedText(group: Group, newText: string, options = {}) {
    if (!group || !group._objects) return;

    console.log("updateCurvedText", options);

    const curvedType = group.curvedType || "arc";
    const curvedOptions = { ...group.curvedOptions, ...options };

    // 创建新文本
    let newChars = newText.split("");
    let newObjects: Textbox[] = [];

    switch (curvedType) {
      case "arc":
        newObjects = this._createArcChars(newChars, curvedOptions);
        break;
      case "circle":
        newObjects = this._createCircleChars(newChars, curvedOptions);
        break;
      case "wave":
        newObjects = this._createWaveChars(newChars, curvedOptions);
        break;
    }

    // console.log("newObjects", newObjects[0].toJSON());
    // return;

    // 移除旧文本
    group.removeAll();

    const { left, top } = group;
    // 添加新字符
    group.add(...newObjects);
    group.set({
      curvedOptions: curvedOptions,
    });
    group.setCoords();

    group.set({ left, top });
    group.setCoords();

    this.canvas.fire("object:modified", { target: group });

    this.canvas.requestRenderAll();
  }

  _createArcChars(chars: string[], options: any) {
    const {
      radius = 100,
      startAngle = 0,
      endAngle = Math.PI,
      padding = 0,
      ...others
    } = options;

    const totalAngle = endAngle - startAngle;
    const angleStep = chars.length > 1 ? totalAngle / (chars.length - 1) : 0;

    return chars.map((char, i) => {
      const angle = startAngle + i * angleStep;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      return new Textbox(char, {
        fontSize: 30,
        fill: "#333",
        originX: "center",
        originY: "center",
        ...others,
        left: x,
        top: y + padding,
        angle: ((angle + Math.PI / 2) * 180) / Math.PI,
      });
    });
  }

  _createCircleChars(chars: string[], options: any) {
    const {
      radius = 100,
      fontSize = 30,
      left = 300,
      top = 200,
      startAngle = 0,
      clockwise = false,
      spacing = 1.0,
      ...others
    } = options;

    const charWidth = fontSize * 0.6; // 估算字符宽度
    const circumference = 2 * Math.PI * radius;
    const totalAngle = (charWidth * chars.length * spacing) / radius;
    const angleStep = totalAngle / chars.length;

    return chars.map((char, i) => {
      const angle = startAngle + (clockwise ? 1 : -1) * i * angleStep;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      return new Textbox(char, {
        originX: "center",
        originY: "center",
        fontSize,
        ...others,
        angle: ((angle + Math.PI / 2) * 180) / Math.PI,
        left: x,
        top: y,
      });
    });
  }
  _createWaveChars(chars: string[], options: any) {
    const {
      amplitude = 20,
      frequency = 0.05,
      fontSize = 30,
      left = 100,
      top = 200,
      phase = 0,
      ...others
    } = options;
    const charSpacing = fontSize * 0.8;

    return chars.map((char: string, i: number) => {
      const x = i * charSpacing;
      const y = Math.sin(x * frequency + phase) * amplitude;

      // 计算切线角度
      const slope = Math.cos(x * frequency + phase) * amplitude * frequency;
      const angle = (Math.atan(slope) * 180) / Math.PI;

      return new Textbox(char, {
        // angle: angle,
        originX: "center",
        originY: "center",
        fontSize,
        ...others,
        left: x,
        top: y,
      });
    });
  }
}

export function updateStyle(
  props: Partial<{
    fill: string;
    stroke: string;
    strokeWidth: number;
    fontSize: number;
    fontWeight: string | number;
    fontStyle: string;
  }>,
  group?: Group,
  canvas?: Canvas
) {
  if (group && canvas) {
    group?.getObjects().forEach((obj) => {
      obj.set(props);
    });
    // 手动触发 modified 事件
    canvas.fire("object:modified", { target: group });
    canvas.renderAll();
  }
}
