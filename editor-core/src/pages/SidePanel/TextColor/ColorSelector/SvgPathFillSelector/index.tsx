import { useEffect } from 'react';
import { useSvgPathFill } from '@hc/editor-core';
import { useGradientColor } from '@/pages/Designer/Sider/Text/GradientColor/useGradientColor';
import { getdataByBackground } from '@/pages/Designer/Sider/Text/GradientColor/util';
import ColorSelector from '../ColorSelector';

const SvgPathFillSelector = (props: { monochrome: Array }) => {
  const { monochrome } = props;
  const { editFlag, list, changeList, getEffectColor, changeAngle } =
    useGradientColor();
  // const [value, updateColor] = useSvgColorsByObserver();
  const { fill, updateFill } = useSvgPathFill();

  const changeMockGradient = (item: string) => {
    const tmp = getdataByBackground(item);
    changeAngle(tmp.angle);
    changeList(tmp.list);
  };

  useEffect(() => {
    if (list.length > 0) {
      const val = getEffectColor();
      val &&
        updateFill({
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
        value={fill}
        updateColor={(tempColor: any) => updateFill(tempColor)}
        changeMockGradient={changeMockGradient}
      />
    </>
  );
};

export default SvgPathFillSelector;
