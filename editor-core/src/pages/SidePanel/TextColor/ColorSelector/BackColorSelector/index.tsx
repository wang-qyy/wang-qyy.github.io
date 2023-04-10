import React, { useEffect } from 'react';
import { useSetTemplateBackgroundColorByObserver, toJS } from '@hc/editor-core';
import { getdataByBackground } from '@/pages/Designer/Sider/Text/GradientColor/util';
import { useGradientColor } from '@/pages/Designer/Sider/Text/GradientColor/useGradientColor';
import ColorSelector from '../ColorSelector';

const BackColorSelector = (props: { monochrome: Array }) => {
  const { monochrome } = props;
  const { editFlag, list, changeList, getEffectColor, changeAngle } =
    useGradientColor();
  const { backgroundColor, update } = useSetTemplateBackgroundColorByObserver();

  const changeMockGradient = (item: string) => {
    const tmp = getdataByBackground(item);
    changeAngle(tmp.angle);
    changeList(tmp.list);
  };

  // 更新背景颜色
  useEffect(() => {
    if (list.length > 0) {
      const val = getEffectColor();
      val &&
        update({
          type: 'linear',
          colorStops: val.colorStops,
          coords: val.coords,
          angle: val.angle,
        });
    }
  }, [editFlag]);

  return (
    <>
      <ColorSelector
        monochrome={monochrome}
        value={backgroundColor}
        updateColor={(tempColor: any) => {
          update(tempColor);
        }}
        changeMockGradient={changeMockGradient}
      />
    </>
  );
};

export default BackColorSelector;
