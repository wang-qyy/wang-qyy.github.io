import React, { useEffect } from 'react';
import { useSvgColorsByObserver, toJS } from '@hc/editor-core';
import { useGradientColor } from '@/pages/Designer/Sider/Text/GradientColor/useGradientColor';
import { getdataByBackground } from '@/pages/Designer/Sider/Text/GradientColor/util';
import ColorSelector from '../ColorSelector';

const SvgColorSelector = (props: { monochrome: Array }) => {
  const { monochrome } = props;
  const { editFlag, list, changeList, getEffectColor, changeAngle } =
    useGradientColor();
  const [value, updateColor] = useSvgColorsByObserver();

  const changeMockGradient = (item: string) => {
    const tmp = getdataByBackground(item);
    changeAngle(tmp.angle);
    changeList(tmp.list);
  };

  useEffect(() => {
    if (list.length > 0) {
      const val = getEffectColor();
      val &&
        updateColor({
          ...value,
          [Object.keys(value)[0]]: {
            id: Object.keys(value)[0],
            color: {
              type: 'linear',
              colorStops: val.colorStops,
              coords: val.coords,
              angle: val.angle,
            },
          },
        });
    }
  }, [editFlag]);
  return (
    <>
      <ColorSelector
        monochrome={monochrome}
        value={value}
        updateColor={(tempColor: any) =>
          updateColor({
            ...value,
            [Object.keys(value)[0]]: {
              id: Object.keys(value)[0],
              color: tempColor,
            },
          })
        }
        changeMockGradient={changeMockGradient}
      />
    </>
  );
};

export default SvgColorSelector;
