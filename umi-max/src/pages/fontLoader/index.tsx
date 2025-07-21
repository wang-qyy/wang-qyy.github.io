import { Button, Input } from "antd";

import {
  buildSmallFontUrl,
  str2unicode,
  initFontFace,
  addFontFace,
  updateText,
} from "./handler";
import { useEffect, useState } from "react";

const fonts = [
  {
    id: "1624",
    font_name: "萌趣小丸子",
    font_file: "zihun93hao-mengquxiaowanzi",
    url: "",
    image_url: "",
    font: "zihun93hao-mengquxiaowanzi__1624_",
    font_hash: "f5ae5b0c11df4938a109fe7c6d28e993.1624",
    type: "2",
    words: str2unicode("这里用的是中文小字体包"),
  },

  {
    id: "1928",
    font_name: "標小智龍珠體-Regular",
    font_file: "LongZhuTi-Regular",
    url: "",
    image_url: "",
    font: "LongZhuTi-Regular__1928_",
    font_hash: "0e06ffd06259535755c22bb51c3ccd8b.1928",
    type: "2",
    words: "这里用的是中文小字体包",
  },
];

export default () => {
  const [font, setFont] = useState("");

  const [inputVal, setInputVal] = useState<string>("这里用的是中文小字体包");
  function onClick() {
    console.log("click");
    addFontFace(fonts[1]);
    setFont(fonts[1].font);
  }

  useEffect(() => {
    initFontFace([fonts[0]]);
  }, []);

  return (
    <div>
      <Button onClick={() => onClick()}>set font</Button>

      <div style={{ fontFamily: fonts[0].font }}>这里用的是中文小字体包</div>

      <Input
        value={inputVal}
        style={{ fontFamily: font, width: "100%" }}
        onChange={(e) => setInputVal(e.target.value)}
        onPressEnter={() => {
          console.log(inputVal);
          updateText(inputVal, font);
        }}
      />
    </div>
  );
};
