import { Button } from "antd";
import WebFont from "webfontloader";
import { useState } from "react";

import { gradientColors, colors } from "./data";
import { gradientObj2Str } from "./handler";

import "./index.less";

const font = {
  id: "4420",
  font_name: "LuxuriousScript-Regular",
  url: "https://js.pngtree.com/fonts/LuxuriousScript-Regular.woff2",
  image_url:
    "https://js.pngtree.com/fonts/previews/luxuriousscript-regular.png",
  font: "LuxuriousScript-Regular",
  font_hash: "",
};
/** 加载字体 */
export function isFontLoaded(): Promise<boolean> {
  console.log("isFontLoaded 执行");

  return new Promise((resolve) => {
    WebFont.load({
      custom: {
        families: [font.font],
        urls: [font.url],
      },
      timeout: 60000,
      active: () => {
        console.log("active");

        resolve(true);
      },
      inactive: () => {
        console.log("inactive");

        resolve(false);
      },
      fontinactive() {
        console.log("fontinactive");
      },
    });
  });
}

export default () => {
  const [fontName, setFontName] = useState("");

  async function setFontFamily() {
    await isFontLoaded();

    // console.log("setFontFamily loaded");

    setFontName(font.font);
  }

  console.log("fontName", fontName);

  return (
    <>
      <span style={{ fontFamily: fontName }}>{font.font}</span>

      <Button onClick={() => setFontFamily()}>
        <span style={{ fontFamily: fontName }}>{font.font}</span>
      </Button>
      <div style={{ display: "flex", gap: 10 }}>
        {gradientColors.map((color, index) => (
          <div
            key={index}
            style={{ background: color, width: 20, height: 20 }}
          ></div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {colors.map((color, index) => {
          const background = gradientObj2Str(color);

          return (
            <div
              key={index}
              style={{ background, width: 20, height: 20 }}
            ></div>
          );
        })}
      </div>
      {/* <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {colors.map((color, index) => {
          const background = gradientObj2Str(color);
          return (
            <svg key={index} style={{ background, width: 20, height: 20 }}>
              <linearGradient
                id={`icon-gradient-${index}`}
                gradientTransform="rotate(-90)"
              >
                {color?.colorStops.map((stop) => (
                  <stop
                    offset={`${stop.offset * 100}%`}
                    stop-color={stop.color}
                  />
                ))}
              </linearGradient>

              <rect
                x="0"
                y="0"
                width="20"
                height="20"
                fill={`url(#icon-gradient-${index})`}
              />
            </svg>
          );
        })}
      </div> */}
    </>
  );
};
