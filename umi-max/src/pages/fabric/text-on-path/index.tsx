import {
  Canvas,
  Circle,
  FabricObject,
  FabricText,
  Group,
  Line,
  Path,
  Textbox,
} from "fabric";
import { Input, ColorPicker, Slider, Select, Form, Divider, Tabs } from "antd";
import { useLayoutEffect, useRef, useState } from "react";

import {
  applyPreset,
  exportJSON,
  importJSON,
  CurvedTextExtension,
  createCurvedText,
  updateSelectedText,
  clearCanvas,
  updateStyle,
} from "./utils";
import "./index.less";
import mockData from "./mock";

// 工具函数：创建弧线
function createArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  color = "red"
) {
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;

  const startX = centerX + radius * Math.cos(startRad);
  const startY = centerY + radius * Math.sin(startRad);
  const endX = centerX + radius * Math.cos(endRad);
  const endY = centerY + radius * Math.sin(endRad);

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  const pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

  return new Path(pathData, {
    fill: "",
    stroke: color,
    strokeWidth: 3,
    strokeLineCap: "round",
  });
}

export default function () {
  const canvasRef = useRef<Canvas>();
  const handler = useRef<CurvedTextExtension>();

  const [activeObj, setActiveObj] = useState<Group>();

  const [formRef] = Form.useForm();

  useLayoutEffect(() => {
    canvasRef.current = new Canvas("canvas");

    handler.current = new CurvedTextExtension(canvasRef.current);

    const handleSelection = (e: { selected: FabricObject[] }) => {
      const obj = e.selected[0] as Group;

      if (obj?.type !== "group") {
        return;
      }
      if (obj) {
        setActiveObj(obj);
        // 获取第一个文本对象作为活动文本

        const textObj = (
          obj.type.toLocaleLowerCase() === "group"
            ? obj
                .getObjects()
                ?.find((i) => i.type.toLocaleLowerCase() == "textbox")
            : obj
        ) as FabricText;

        formRef.setFieldsValue({
          curveType: obj.curvedType,
          text:
            obj.type.toLocaleLowerCase() === "group"
              ? obj
                  .getObjects()
                  .map((i) => (i as FabricText).text)
                  .join("")
              : textObj.text,
          ...obj.curvedOptions,

          startAngle: Math.round(
            ((obj.curvedOptions.startAngle || Math.PI) * 180) / Math.PI
          ),
          endAngle: Math.round(
            ((obj.curvedOptions.endAngle || Math.PI) * 180) / Math.PI
          ),
          fontSize: textObj.fontSize,
          fill: textObj.fill,
          stroke: textObj.stroke,
          strokeWidth: textObj.strokeWidth,
          fontWeight: textObj.fontWeight,
          fontStyle: textObj.fontStyle,
        });
      }
    };

    canvasRef.current.on("selection:created", handleSelection);
    canvasRef.current.on("selection:updated", handleSelection);

    // 监听对象修改事件
    canvasRef.current.on("object:modified", (e) => {
      const obj = e.target as Group;
      if (obj) {
        setActiveObj(obj);
      }
    });

    // 初始示例
    const props = {
      radius: 200,
      startAngle: -Math.PI,
      endAngle: 0,
      fontSize: 36,
      fill: "#667eea",
      stroke: "#4c51bf",
      strokeWidth: 2,
      fontWeight: "bold",
      left: 400,
      top: 300,
    };

    handler.current.createArcText("Fabric.js 6.0+", props);

    const left = 100 * Math.cos(30) + 50 - 2 + 100;
    const top = 100 * Math.sign(60) + 50 - 2 - 150;

    canvasRef.current.add(
      ...[
        new Circle({ left: 50, top: 50, radius: 100, fill: "#eee" }),
        new Line([0, 100, 350, 100], {
          stroke: "#000",
          width: 10,
          left: 0,
          top: 150,
        }),
        new Line([100, 0, 100, 350], {
          stroke: "#000",
          width: 10,
          left: 150,
          top: 0,
        }),
        // new Circle({ left: 50 - 2, top: 150 - 2, fill: "red", radius: 2 }),
        // new FabricText("A 50,150", {
        //   left: 50,
        //   top: 150,
        //   fill: "red",
        //   fontSize: 12,
        // }),

        // new Circle({
        //   left,
        //   top,
        //   // left: 250 - 2, top: 150 - 2,

        //   fill: "red",
        //   radius: 2,
        // }),

        // new FabricText("B 50,150", {
        //   left: 250,
        //   top: 150,
        //   fill: "red",
        //   fontSize: 12,
        // }),
      ]
    );

    // 清理函数
    return () => {
      if (canvasRef.current) {
        canvasRef.current.off("selection:created", handleSelection);
        canvasRef.current.off("selection:updated", handleSelection);
        canvasRef.current.off("object:modified");
      }
    };
  }, []);

  // "arc", "circle", "wave", "spiral"
  const options = [
    {
      key: "radius",
      label: "半径",
      include: ["arc", "circle"],
      min: 50,
      max: 300,
    },

    {
      key: "startAngle",
      label: "起始角度",
      include: ["arc", "circle"],
      min: -180,
      max: 180,
    },
    {
      key: "endAngle",
      label: "结束角度",
      include: ["arc"],
      min: -180,
      max: 180,
    },
    {
      key: "padding",
      label: "垂直偏移",
      include: ["arc", "circle"],
      min: -50,
      max: 50,
    },
    {
      key: "spacing",
      label: "字符间距",
      include: ["circle"],
      min: 0.5,
      max: 2,
      step: 0.1,
    },
    {
      key: "amplitude",
      label: "波浪幅度",
      include: ["wave"],
      min: 0,
      max: 100,
    },
    {
      key: "frequency",
      label: "波浪频率",
      include: ["wave"],
      min: 1,
      max: 100,
    },
    { key: "phase", label: "相位偏移", include: ["wave"], min: 0, max: 628 },
    {
      key: "startRadius",
      label: "起始半径",
      include: ["spiral"],
      min: 20,
      max: 100,
    },
    {
      key: "radiusIncrement",
      label: "半径增量",
      include: ["spiral"],
      min: 1,
      max: 20,
    },
    {
      key: "angleIncrement",
      label: "角度增量",
      include: ["spiral"],
      min: 1,
      max: 50,
    },
  ];

  /**
   * 如果圆心角是角度制（0-360度），可使用此版本
   * @param {number} arcLength - 弧长
   * @param {number} angleInDegrees - 圆心角（角度）
   * @returns {number} 圆的半径
   */
  function calculateRadiusFromDegrees(
    arcLength: number,
    angleInDegrees: number
  ) {
    if (angleInDegrees <= 0 || angleInDegrees >= 360) {
      throw new Error("圆心角必须是0到360度之间的值");
    }
    if (arcLength <= 0) {
      throw new Error("弧长必须大于0");
    }
    // 将角度转换为弧度
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    return arcLength / angleInRadians;
  }

  return (
    <div className="container">
      <div className="canvas-container">
        <canvas id="canvas" width="800" height="600"></canvas>

        {["type", "width", "height", "left", "top"].map((key) => (
          <p key={key}>
            {key}: {activeObj?.[key]}
          </p>
        ))}

        <div style={{ width: "100%", overflowX: "auto" }}>
          <pre
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(activeObj?.toJSON())?.replaceAll(
                ',"',
                '<br/>"'
              ),
            }}
          />
        </div>
      </div>

      <div className="controls">
        <h2>控制面板</h2>

        <Tabs
          items={[
            {
              key: "text",
              label: "文本设置",

              children: (
                <Form
                  layout="vertical"
                  form={formRef}
                  initialValues={{
                    text: "弯曲文本效果",
                    curveType: "arc",
                  }}
                >
                  <Form.Item name="text" label="文本内容">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                  <Form.Item name="curveType" label="弯曲类型">
                    <Select>
                      <Select.Option value="arc">arc 弧形</Select.Option>
                      <Select.Option value="circle">circle 圆形</Select.Option>
                      <Select.Option value="wave">wave 波浪形</Select.Option>
                      <Select.Option value="spiral">
                        spiral 螺旋形
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "curve",
              label: "曲线设置",

              children: (
                <>
                  <Slider
                    onChange={(a) => {
                      console.log("onChange", a);

                      const radius = calculateRadiusFromDegrees(523, a);
                      formRef.setFieldValue("radius", radius);

                      const endAngle = a / 2;

                      updateSelectedText(
                        activeObj!,
                        {
                          ...formRef.getFieldsValue(),
                          startAngle: endAngle - 180,
                          endAngle,
                          radius,
                        },
                        handler.current!
                      );
                    }}
                    min={1}
                    max={359}
                    defaultValue={150}
                  />
                  <Form
                    form={formRef}
                    layout="vertical"
                    onValuesChange={(changedValues, values) => {
                      updateSelectedText(
                        activeObj!,
                        { ...formRef.getFieldsValue(), ...values },
                        handler.current!
                      );
                    }}
                    // preserve={false}
                  >
                    {options
                      .filter((i) =>
                        i.include.includes(activeObj?.get("curvedType") || "")
                      )
                      .map(({ key, label, include, ...others }) => (
                        <Form.Item
                          key={key}
                          name={key}
                          label={`${label}-${key}`}
                        >
                          <Slider {...others} />
                        </Form.Item>
                      ))}
                  </Form>
                </>
              ),
            },
            {
              key: "style",
              label: "样式设置",
              children: (
                <Form
                  onValuesChange={(changedValues) => {
                    updateStyle(changedValues, activeObj, canvasRef.current);
                  }}
                  form={formRef}
                  layout="vertical"
                >
                  <Form.Item name="fontSize" label="字体大小">
                    <Slider min={12} max={72} />
                  </Form.Item>
                  <Form.Item
                    name="fill"
                    label="字体颜色"
                    getValueFromEvent={(e) => e.toHexString()}
                  >
                    <ColorPicker />
                  </Form.Item>
                  <Form.Item
                    name="stroke"
                    label="描边颜色"
                    getValueFromEvent={(e) => e.toHexString()}
                  >
                    <ColorPicker />
                  </Form.Item>
                  <Form.Item name="strokeWidth" label="描边宽度">
                    <Slider min={0} max={5} />
                  </Form.Item>

                  <Form.Item name="fontWeight" label="字体粗细">
                    <Select>
                      <Select.Option value="normal">正常</Select.Option>
                      <Select.Option value="bold">加粗</Select.Option>
                      <Select.Option value="600">600</Select.Option>
                      <Select.Option value="700">700</Select.Option>
                      <Select.Option value="800">800</Select.Option>
                      <Select.Option value="900">900</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="fontStyle" label="字体样式">
                    <Select>
                      <Select.Option value="normal">正常</Select.Option>
                      <Select.Option value="italic">斜体</Select.Option>
                      <Select.Option value="oblique">倾斜</Select.Option>
                    </Select>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />

        <div className="control-group">
          <label>预设效果</label>
          <div className="preset-grid">
            {[
              { value: "gentle", label: "轻柔弧形" },
              { value: "strong", label: "强烈弧形" },
              { value: "fullCircle", label: "完整圆形" },
              { value: "sineWave", label: "正弦波浪" },
              { value: "spiralIn", label: "内旋螺旋" },
              { value: "spiralOut", label: "外旋螺旋" },
            ].map((item) => (
              <button
                key={item.value}
                className="preset-btn"
                onClick={() => {
                  formRef.setFieldsValue(applyPreset(item.value));
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="control-group">
          <button
            onClick={() => {
              createCurvedText(formRef.getFieldsValue(), handler.current!);
            }}
          >
            创建弯曲文本
          </button>
          <button
            className="secondary"
            onClick={() => {
              updateSelectedText(
                activeObj!,
                formRef.getFieldsValue(),
                handler.current!
              );
            }}
          >
            更新选中文本
          </button>
          <Divider />
          <button
            className="secondary"
            onClick={() => exportJSON(canvasRef.current)}
          >
            导出为 JSON
          </button>
          <button
            className="secondary"
            onClick={() => importJSON(canvasRef.current)}
          >
            导入 JSON
          </button>
          <button
            className="danger"
            onClick={() => clearCanvas(canvasRef.current!)}
          >
            清空画布
          </button>
        </div>
      </div>
    </div>
  );
}
