function getIndexInArrayObject(list: any, color: string) {
  let rIndex = -1;
  list.forEach((element: any, index: number) => {
    if (typeof element.value === 'string') {
      if (element.value === color) {
        rIndex = index;
      }
    }
  });
  return rIndex;
}
/**
 * 格式化花字数据 对花字数据的颜色 进行关联系分组
 */
export function formatEffectWordInerColor(effect: any) {
  const { fillList, strokeList, shadowList } = effect;
  const colorList: any[] = [];
  fillList.forEach((element: any, index: number) => {
    if (typeof element.value === 'string') {
      colorList.push({
        value: element.value,
        fillIndexList: [index], // 填充关联的index数组
        strokeIndexList: [], // 描边关联的index数组
        shadowIndexList: [], // 阴影关联的index数组
      });
    }
  });
  strokeList.forEach((element: any, index: number) => {
    if (typeof element.value === 'string') {
      const colorListIndex = getIndexInArrayObject(colorList, element.value);
      if (colorListIndex > -1) {
        colorList[colorListIndex].strokeIndexList.push(index);
      } else {
        colorList.push({
          value: element.value,
          fillIndexList: [], // 填充关联的index数组
          strokeIndexList: [index], // 描边关联的index数组
          shadowIndexList: [], // 阴影关联的index数组
        });
      }
    }
  });
  shadowList.forEach((element: any, index: number) => {
    if (typeof element.color === 'string') {
      const colorListIndex = getIndexInArrayObject(colorList, element.color);
      if (colorListIndex > -1) {
        colorList[colorListIndex].shadowIndexList.push(index);
      } else {
        colorList.push({
          value: element.color,
          fillIndexList: [], // 填充关联的index数组
          strokeIndexList: [], // 描边关联的index数组
          shadowIndexList: [index], // 阴影关联的index数组
        });
      }
    }
  });
  return {
    ...effect,
    colorList,
  };
}
// 拆分填充数据
export function formatFillsData(fdata: any) {
  const data = JSON.parse(JSON.stringify(fdata));

  let layList: any[] = [];
  const { supportTexts = [], text, fills, fillList, color, ...other } = data;
  if (fills.length === 0) {
    data.opacity = 1;
    const exist =
      fillList.filter((pct: any) => {
        return pct.value === color;
      }).length > 0;
    if (!exist) {
      fillList.push({
        value: color,
      });
    }
    data.fills = [fillList.length - 1];
  }
  if (fills.length > 1) {
    fills.forEach((item: any, index: number) => {
      if (index === fills.length - 1) {
        data.fills = [item];
        data.shadow = [];
      } else {
        layList.push({
          ...other,
          text,
          strokes: [],
          fills: [item],
          left_diff: 0,
          top_diff: 0,
        });
      }
    });
  }
  supportTexts.forEach((element: any) => {
    const { fills: eFills, color: eColor, ...eother } = element;
    if (eFills.length === 0) {
      const exist =
        fillList.filter((pct: any) => {
          return pct.value === eColor;
        }).length > 0;
      if (!exist) {
        fillList.push({
          value: eColor,
        });
      }
      element.fills = [fillList.length - 1];
      element.opacity = 1;
      layList.push(element);
    }
    if (eFills.length === 1) {
      layList = supportTexts;
    }
    if (eFills.length > 1) {
      eFills.forEach((item: any, index: number) => {
        if (index === eFills.length - 1) {
          layList.push({
            ...other,
            text,
            strokes: [],
            fills: [item],
            shadow: [],
            left_diff: 0,
            top_diff: 0,
          });
        } else {
          layList.push({
            ...eother,
            text,
            opacity: 1,
            fills: [item],
            left_diff: 0,
            top_diff: 0,
          });
        }
      });
    }
  });
  data.fillList = fillList;
  data.supportTexts = layList;
  data.text = text;
  return data;
}
