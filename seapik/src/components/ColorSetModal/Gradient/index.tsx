import { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useMount } from 'ahooks';
import { GradientColor } from '@/kernel';

import ColorPickup from '@/components/ColorPickup';
import GradientPicker from './component/gradientPicker';
import DegPicker from './component/degPicker';
import { useGradientColor } from './useGradientColor';
import './index.less';

type GradientColorType = 'radial' | 'linear';

const Gradient = (props: {
  type: GradientColorType;
  value: GradientColor;
  onChange: (val: GradientColor) => void;
  setType: (type: GradientColorType) => void;
}) => {
  const { type, value, onChange, setType } = props;
  const containerRef = useRef(null);
  const {
    editFlag,
    current,
    list,
    angle,
    background,
    initGradientDataByEffect,
    deleteCurrent,
    getEffectColor,
    changeList,
    setActiveIndex,
    changeColor,
    changeAngle,
    setEditFlag,
    _colorType,
    colorType,
  } = useGradientColor(() => {});

  useMount(() => {
    if (value) {
      initGradientDataByEffect(value);
    }
  });
  useEffect(() => {
    if (list.length > 0) {
      const val = getEffectColor();

      onChange && val && onChange(val as GradientColor);
    }
  }, [editFlag]);

  return (
    <div className="gradient-color">
      <div className="gradient-picker-panel">
        <div className="gradient-picker-panel-picker" ref={containerRef}>
          <GradientPicker
            background={background}
            activeIndex={current}
            list={list}
            changeList={changeList}
            setActiveIndex={setActiveIndex}
            deleteCurrent={deleteCurrent}
            colorType={colorType}
          />
        </div>
      </div>
      <div className="flex-box items-center mb-16">
        <div className="gradient-color-type-radio">
          {(
            [
              { key: 'linear', name: 'Linear' },
              { key: 'radial', name: 'Radial' },
            ] as { key: GradientColorType; name: string }[]
          ).map((item) => {
            return (
              <div
                key={item.key}
                onClick={() => {
                  setType(item.key);
                  _colorType(item.key);
                  setEditFlag(!editFlag);
                }}
                className={classNames('gradient-color-type-radio-item', {
                  'item-active': type === item.key,
                })}
              >
                {item.name}
              </div>
            );
          })}
        </div>
        {type === 'linear' && (
          <DegPicker onChange={changeAngle} angle={angle} />
        )}
      </div>

      <ColorPickup
        color={list[current]?.color || ''}
        onChange={({ rgb }) => {
          changeColor(rgb);
          setEditFlag(!editFlag);
        }}
      />
    </div>
  );
};
export default Gradient;
