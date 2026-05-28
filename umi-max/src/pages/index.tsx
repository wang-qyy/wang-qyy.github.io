import { observer } from "mobx-react";

import { fourColorPresets, twoColorPresets } from "../utils";

import { colorGenerator } from "../utils/color";
import { useEffect, Component } from "react";

const list1 = [
  "rgb(0, 0, 0)",
  "rgb(191, 191, 191)",
  "rgb(221, 16, 16)",
  "rgb(255, 237, 2)",
  "rgb(55, 142, 60)",
];

const list = [
  "rgb(0, 0, 0)",
  "rgb(221, 16, 16)",
  "rgb(194, 24, 91)",
  "rgb(123, 31, 162)",
  "rgb(81, 45, 168)",
  "rgb(48, 64, 159)",
  "rgb(25, 118, 210)",
  "rgb(0, 121, 107)",
  "rgb(55, 142, 60)",
  "rgb(251, 191, 46)",
  "rgb(245, 124, 0)",
  "rgb(230, 73, 25)",
  "rgb(93, 64, 55)",
  "rgb(255, 91, 69)",
  "rgb(255, 255, 166)",
  "rgb(244, 102, 28)",
  "rgb(208, 230, 74)",
  "rgb(255, 237, 2)",
  "rgb(226, 225, 233)",
  "rgb(143, 206, 214)",
  "rgb(242, 60, 60)",
  "rgb(242, 225, 5)",
  "rgb(200, 65, 36)",
  "rgb(212, 169, 96)",
];
function HomePage() {
  return (
    <>
      <div>
        {[
          list1.map((color) =>
            colorGenerator.generateCombinationFromRgb(color, 2)
          ),
          list.map((color) =>
            colorGenerator.generateCombinationFromRgb(color, 3)
          ),
          list.map((color) =>
            colorGenerator.generateCombinationFromRgb(color, 4)
          ),
          list.map((color) =>
            colorGenerator.generateCombinationFromRgb(color, 5)
          ),
        ].map((group) => (
          <div>
            <p>
              {group[0].length}色{group.length}组
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
              {group.map((item, index) => {
                return (
                  <div key={index} style={{ width: "33%" }}>
                    <div style={{ display: "flex", margin: 12 }}>
                      {item.map((color) => (
                        <div key={color} style={{ flex: 1 }}>
                          <div
                            style={{
                              background: color,
                              height: 30,
                              border: "1px solid #eee",
                            }}
                          />
                          {color}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default observer(HomePage);
