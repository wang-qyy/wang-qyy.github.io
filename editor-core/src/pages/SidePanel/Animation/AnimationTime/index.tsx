import { InputNumber, Slider } from 'antd';
import { Range, RangeProps } from 'rc-slider';
import ArrowNodeHandle from '@/components/AnimationRange/ArrowNodeHandle';

import { useAssetAeADurationByObserver, observer } from '@hc/editor-core';

import './index.less';

const config = {
  min: 0,
  step: 100,
};

function AnimationTime(props: any) {
  const {
    data: { type, title },
  } = props;

  const { value, update, max, hasBoth, updateBoth } =
    useAssetAeADurationByObserver();

  if (value[type] === 0 || (type === 'o&i' && !hasBoth)) {
    return <></>;
  }

  function onChange(data: number) {
    update(type, data);
  }

  function onChangeBoth(data: number[]) {
    const i = data[0];
    const o = data[1];

    updateBoth({ i, o });
  }

  return (
    <div className="animation-time-box">
      <span className="animation-time-label">动画时长（毫秒）</span>
      <div className="animation-time-slider-wrap">
        {hasBoth ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>入场</span>
              <div style={{ flex: 1, padding: '0 8px' }}>
                <Range
                  key={max}
                  handle={params => {
                    return (
                      <ArrowNodeHandle
                        type="icontuodong"
                        key={`${params.prefixCls}-${params.index}`}
                        {...params}
                      />
                    );
                  }}
                  allowCross={false}
                  max={max}
                  {...config}
                  onChange={v => {
                    onChangeBoth([v[0], max - v[1]]);
                  }}
                  value={[value.i, max - value.o]}
                />
              </div>
              <span>出场</span>
            </div>

            <div className="animation-time-input">
              <InputNumber
                {...config}
                max={max - value.o}
                value={value.i}
                onChange={v => onChangeBoth([v, value.o])}
              />
              <InputNumber
                {...config}
                max={max - value.i}
                value={value.o}
                onChange={v => onChangeBoth([value.i, v])}
              />
            </div>
          </>
        ) : (
          <>
            <Slider
              max={max}
              value={value[type]}
              onChange={onChange}
              tooltipVisible={false}
            />
            <div className="animation-time-input">
              <InputNumber
                {...config}
                value={value[type]}
                onChange={onChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default observer(AnimationTime);
