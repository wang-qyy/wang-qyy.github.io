import { RGBAToString } from '@/utils/single';
import { useFontEffectByObserver, observer, RGBA, toJS } from '@hc/editor-core';
import { getBackgroundByEffect } from '../../../../GradientColor/util';
import EffectMachineItem from './item';

const EffectMachine = () => {
  const { updateFontEffectColor, updateBatchFontEffectSolidColor, value } =
    useFontEffectByObserver();
  const { effectColorful } = value;
  const { effect } = effectColorful;
  const {
    colorList = [],
    fillList = [],
    strokeList = [],
    sourceList = [],
  } = effect;
  // console.log('花字特效===', toJS(effect));
  const colorListMap = () => {
    const tmpMap: any[] = [];
    colorList.forEach((element: any, index: number) => {
      const map = {
        index,
        type: 'color',
        background: element.value,
        color: element.value,
      };
      tmpMap.push(map);
    });
    return { data: tmpMap };
  };
  const fillListMap = () => {
    const tmpMap: any[] = [];
    fillList.forEach((element: any, index: number) => {
      if (
        element.value?.type !== 'pattern' &&
        typeof element.value !== 'string'
      ) {
        const tmp = JSON.parse(JSON.stringify(element.value));
        tmp.angle = element.angle;
        const map = {
          index,
          type: 'gradient',
          background: getBackgroundByEffect(tmp),
          color: tmp,
        };
        tmpMap.push(map);
      }
    });
    return { data: tmpMap };
  };
  const strokeListMap = () => {
    const tmpMap: any[] = [];
    strokeList.forEach((element: any, index: number) => {
      if (typeof element.value !== 'string') {
        const tmp = JSON.parse(JSON.stringify(element.value));
        tmp.angle = element.angle;
        const map = {
          index,
          type: 'gradient',
          background: getBackgroundByEffect(tmp),
          color: tmp,
        };
        tmpMap.push(map);
      }
    });
    return { data: tmpMap };
  };
  const sourceListMap = () => {
    const tmpMap: any[] = [];
    sourceList.forEach(element => {
      const map = {
        type: 'image',
        background: element,
      };
      tmpMap.push(map);
    });
    return { data: tmpMap };
  };
  const itemChangeFill = (color: RGBA | Object, index: number) => {
    updateFontEffectColor(
      index,
      {
        ...fillList[index],
        angle: color.angle,
        value: {
          ...fillList[index].value,
          colorStops: color.colorStops,
          coords: color.coords,
        },
      },
      'fill',
    );
  };
  const itemChangeStroke = (color: RGBA, index: number) => {
    updateFontEffectColor(
      index,
      {
        ...strokeList[index],
        angle: color.angle,
        value: {
          ...strokeList[index].value,
          colorStops: color.colorStops,
          coords: color.coords,
        },
      },
      'stroke',
    );
  };

  const itemChangeSource = (url: string, index: number) => {
    updateFontEffectColor(index, url, 'source');
  };
  const itemChangeSolidColor = (
    index: number,
    oldColor: string,
    color: RGBA,
  ) => {
    updateBatchFontEffectSolidColor(index, RGBAToString(color));
  };
  return (
    <div className="effect-machine-container">
      {/* 纯色部分 */}
      {colorListMap().data.map((item: any, index: number) => {
        return (
          <EffectMachineItem
            key={index}
            {...item}
            onChange={(val: RGBA) => {
              itemChangeSolidColor(index, item.color, val);
            }}
          />
        );
      })}
      {/* 填充部分 */}
      {fillListMap().data.map(item => {
        return (
          <EffectMachineItem
            key={item.index}
            {...item}
            onChange={(val: RGBA | Object) => {
              itemChangeFill(val, item.index);
            }}
          />
        );
      })}
      {/* 描边部分 */}
      {strokeListMap().data.map((item, index) => {
        return (
          <EffectMachineItem
            key={index}
            {...item}
            onChange={(val: RGBA | Object) => {
              itemChangeStroke(val, item.index);
            }}
          />
        );
      })}
      {/* 图片填充部分 */}
      {sourceListMap().data.map((item, index) => {
        return (
          <EffectMachineItem
            key={item}
            {...item}
            onChange={val => {
              itemChangeSource(val, index);
            }}
          />
        );
      })}
    </div>
  );
};
export default observer(EffectMachine);
