import { mouseMoveDistance } from "@/utils";
import { useState } from "react";

const asset = {
  meta: {
    type: "text",
  },
  transform: {
    posX: 40,
    posY: 639,
    alpha: 100,
    zindex: 3,
    rotate: 0,
  },
  attribute: {
    width: 1071.6,
    height: 1204,
    text: ["暑"],
    fontFamily: "zihun34hao-shaonianhefengti-Regular__1791_",
    fontSize: 1062,
    fontWeight: "normal",
    color: {
      a: 1,
      r: 0,
      g: 0,
      b: 0,
    },
    lineHeight: 12,
    letterSpacing: 0,
    textAlign: "center",
    effectColorful: {
      effect: {
        fontSize: 1062,
        fontWeight: "normal",
        charSpacing: 0,
        sourceList: [
          "/thumb_back/fw800/background/20240522/pngtree-abstract-light-pink-and-purple-background-image_15685363.jpg",
        ],
        fillList: [
          {
            value: {
              type: "pattern",
              opacity: 1,
              repeat: "no-repeat",
              sourceIndex: 0,
              posX: -955,
              posY: -1047,
              width: 3000,
              height: 3000,
            },
          },
        ],
        fills: [0],
        supportTexts: [
          {
            fills: [0],
          },
        ],
      },
    },
  },
  extra: {
    blend_mode: "norm",
    pRunArrayData: [
      [
        2,
        2,
        {
          justification: 2,
          first_line_indent: 0,
          start_indent: 0,
          end_indent: 0,
          space_before: 0,
          space_after: 0,
          auto_leading_value: 1.2,
        },
      ],
    ],
    runArrayData: [
      [
        2,
        2,
        {
          font_name: "34--Regular",
          color_type: 1,
          font_size: 300,
          color: {
            a: 1,
            r: 0,
            g: 0,
            b: 0,
          },
          line_height: 123.7971,
          line_spacing: 0,
          writing_direction: 0,
          auto_leading: false,
          faux_bold: false,
          faux_italic: false,
          font_caps: 0,
          font_baseline: 0,
          underline: false,
          strikethrough: false,
          has_line_hight: true,
          reset_line_hight: false,
        },
      ],
    ],
    transform: {
      Angle: 0,
      Scale1: 3.551962400894884,
      Scale2: 3.548628252795084,
      MoveX: 516.7355310703357,
      MoveY: 1587.0155199870278,
    },
    origin_transform: [
      3.551962400894884, 0, 0, 3.548628252795084, 516.7355310703357,
      1587.0155199870278,
    ],
    justification: 2,
    anti_alias: 4,
  },
};

export default () => {
  const fill =
    asset.attribute.effectColorful.effect.fillList[
      asset.attribute.effectColorful.effect.fills[0]
    ];

  const fillImage = `https://png.pngtree.com${asset.attribute.effectColorful.effect.sourceList[fill.value.sourceIndex]}`;

  const text = asset.attribute.text.join(" ");

  const scale = 0.1;

  const getSize = (scale = 0.1) => ({
    width: fill.value.width * scale,
    height: fill.value.height * scale,
  });

  const [position, setPosition] = useState({
    left: -fill.value.posX,
    top: -fill.value.posY,
  });

  function handleMove(e: MouseEvent | React.MouseEvent) {
    const { left, top } = position;
    mouseMoveDistance(e, (distanceX, distanceY) => {
      console.log(distanceX, distanceY);
      setPosition({
        left: left + distanceX / scale,
        top: top + distanceY / scale,
      });
    });
  }

  return (
    <>
      <div style={{ display: "flex" }}>
        <div style={{ position: "relative", ...getSize() }}>
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div
              style={{
                width: fill.value.width,
                height: fill.value.height,
              }}
            >
              <img src={fillImage} style={{ width: "100%", height: "100%" }} />
            </div>
            <div
              style={{
                position: "absolute",
                fontSize: asset.attribute.fontSize,
                ...position,
                userSelect: "none",
              }}
              onMouseDown={handleMove}
            >
              {text}
            </div>
          </div>
        </div>
        <div style={{ ...getSize(0.1), background: "#eee" }}>
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div
              style={{
                // width: asset.attribute.width,
                // height: asset.attribute.height,
                fontSize: asset.attribute.fontSize,
                fontFamily: asset.attribute.fontFamily,
                position: "absolute",
                top: 0,
                left: 0,
                color: "#000",
                zIndex: 1,
              }}
            >
              {text}
            </div>
            <div
              style={{
                // width: asset.attribute.width,
                // height: asset.attribute.height,
                fontSize: asset.attribute.fontSize,
                fontFamily: asset.attribute.fontFamily,
                backgroundImage: `url(${fillImage})`,
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: `${fill.value.width}px ${fill.value.height}px`,
                backgroundPosition: `-${position.left}px -${position.top}px`,
                backgroundRepeat: fill.value.repeat,
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 2,
              }}
            >
              {text}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
