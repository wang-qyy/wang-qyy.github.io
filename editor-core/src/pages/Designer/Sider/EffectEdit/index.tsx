import { useRef } from 'react';
import { Property } from 'csstype';
import {
  EffectInfo,
  getCurrentAsset,
  observer,
  updateEffect,
} from '@hc/editor-core';
import { reportChange } from '@/kernel/utils/config';
import { defaultEffect } from '@/kernel/utils/const';
import { clickActionWeblog } from '@/utils/webLog';

// import { adjustList } from './options';
import { adjustList } from '@/pages/SidePanel/EffectAdjust/options';
import { Popover, Radio, RadioChangeEvent, Select } from 'antd';
import ColorPickup from '@/components/ColorPickup';
import { RGBAToString } from '@/kernel/utils/single';
import classNames from 'classnames';
import AdjustSlider from '../Slider';
import styles from './index.less';
import { defaultColor, mixBlendModes, radios } from './options';

const FiltersAdjust = () => {
  const asset = getCurrentAsset();

  const changed = useRef(false);

  if (!asset) return null;

  const {
    attribute: { effectInfo },
  } = asset;

  const values = { ...defaultEffect, ...effectInfo };
  const { background, mixBlendMode } = values;

  const radioValue = background ? 'solid' : 'none';

  const onChange = (e: RadioChangeEvent) => {
    const params: EffectInfo = { background: undefined };
    if (e.target.value === 'solid') {
      params.background = defaultColor;
      params.mixBlendMode = 'normal';
    }
    updateEffect({
      params,
      target: asset,
      save: true,
    });
  };

  const modeChange = (v: Property.MixBlendMode) => {
    updateEffect({
      params: { mixBlendMode: v },
      target: asset,
      save: true,
    });
  };

  return (
    <div className="image-controller">
      <div
        className="image-controller-list"
        style={{ color: '#7e8792', fontSize: 12 }}
      >
        <div className={styles.title}>滤镜</div>
        {adjustList.map(item => {
          const {
            range: [min, max],
          } = item;
          const value = values[item.key] as number;

          return (
            <AdjustSlider
              key={item.key}
              wrapperClassName={styles.slider}
              value={value}
              label={item.label}
              className={item.key}
              onChange={v => {
                const params = { [item.key]: v };
                updateEffect({ params, target: asset });
                changed.current = true;
              }}
              min={min}
              max={max}
              onAfterChange={() => {
                // onAfterChange 实际为 onmouseup，即便没有修改值也会触发
                // 所以这里加个判断，触发过 onChange 后才触发保存
                if (!changed.current) return;
                reportChange('updateEffect', true);
                clickActionWeblog('Filters3');
                changed.current = false;
              }}
            />
          );
        })}
        <div className={styles.overlayRow}>
          <div className={styles.overlayColor}>
            <div className={styles.overlayLabel}>叠加</div>
            <Radio.Group
              onChange={onChange}
              className={styles.radioGroup}
              value={radioValue}
            >
              {radios.map(radio => (
                <Radio key={radio.key} value={radio.key}>
                  {radio.label}
                </Radio>
              ))}
            </Radio.Group>
          </div>
          {radioValue === 'solid' && background && (
            <div className={styles.overlayColor}>
              <div className={styles.overlayLabel}>叠加颜色</div>
              <Popover
                trigger="click"
                overlayClassName="color-picker"
                placement="rightBottom"
                // getTooltipContainer={trigger => trigger}
                destroyTooltipOnHide
                content={
                  <div style={{ width: '318px', padding: '10px' }}>
                    <ColorPickup
                      color={background}
                      onChange={color => {
                        updateEffect({
                          params: { background: color.rgb },
                          target: asset,
                          save: true,
                        });
                        clickActionWeblog('Shadow4');
                      }}
                    />
                  </div>
                }
              >
                <div
                  className={styles.colorSelector}
                  style={{
                    backgroundColor: RGBAToString(background),
                  }}
                  onClick={() => {
                    clickActionWeblog('Shadow3');
                  }}
                />
              </Popover>
            </div>
          )}
        </div>
        {radioValue === 'solid' && background && (
          <div className={styles.overlayColor}>
            <div className={styles.overlayLabel}>混合模式</div>
            <Select
              value={mixBlendMode}
              onChange={modeChange}
              className={styles.colorSelector}
            >
              {mixBlendModes.map(mode => (
                <Select.Option key={mode.key} value={mode.key}>
                  {mode.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
      </div>
      <div className="image-controller-bottom">
        <div />
        <div
          className="image-controller-reset"
          onClick={() => {
            updateEffect({
              params: {},
              target: asset,
              replace: true,
              save: true,
            });
            clickActionWeblog('Filters4');
          }}
        >
          重置
        </div>
      </div>
    </div>
  );
};

export default observer(FiltersAdjust);
