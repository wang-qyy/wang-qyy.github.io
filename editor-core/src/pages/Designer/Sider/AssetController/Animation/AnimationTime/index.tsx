import React from 'react';
import { useAssetAeADurationByObserver, observer, AeA } from '@hc/editor-core';
import AnimationRange from '@/components/AnimationRange';
import SliderWithInput from '@/pages/Designer/Sider/components/SliderWithInput';
import style from './index.modules.less';

const config = {
  min: 0,
  step: 100,
};

function AnimationTime({ type }: { type: keyof AeA }) {
  const { value, update, max, hasBoth, updateBoth, updateStayPbr } =
    useAssetAeADurationByObserver();

  if (value[type] === 0) {
    return <></>;
  }
  const showValue = value[type];

  function onChange(data: number) {
    update(type, data);
  }

  function onChangeBoth(data: number[]) {
    const i = data[0];
    const o = data[1];
    updateBoth({ i, o });
  }

  return (
    <div className={style.animationTimeBox}>
      {type === 's' ? (
        <>
          <span className={style.timeLabel}>动画速度</span>
          <SliderWithInput
            onChange={updateStayPbr}
            value={showValue}
            min={0.5}
            step={0.25}
            max={2}
          />
        </>
      ) : (
        <>
          <span className={style.timeLabel}>动画时长(ms)</span>
          {hasBoth ? (
            <AnimationRange
              {...config}
              onChange={onChangeBoth}
              max={max}
              value={[value.i, value.o]}
            />
          ) : (
            <SliderWithInput
              {...config}
              onChange={onChange}
              value={showValue}
              max={max}
            />
          )}
        </>
      )}
    </div>
  );
}

export default observer(AnimationTime);
