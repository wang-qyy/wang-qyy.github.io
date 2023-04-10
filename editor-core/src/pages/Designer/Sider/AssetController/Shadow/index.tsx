import { useRef } from 'react';
import { getCurrentAsset, observer, updateShadow } from '@hc/editor-core';
import { reportChange } from '@/kernel/utils/config';
import SidePanelWrap from '@/components/SidePanelWrap';
import { useSettingPanelInfo } from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';

import { Popover } from 'antd';
import ColorPickup from '@/components/ColorPickup';
import { RGBAToString } from '@/utils/single';
import { adjustList, defaultShadow } from './options';
import styles from './index.less';
import AdjustSlider from '../../Slider';

const ShadowPanel = () => {
  const asset = getCurrentAsset();
  const changed = useRef(false);

  if (!asset) return null;

  const {
    attribute: { dropShadow },
  } = asset;

  const values = { ...defaultShadow, ...dropShadow };

  return (
    <div className={styles.FiltersAdjust}>
      <div className={styles.list}>
        <div className={styles.color}>
          <div className={styles.colorTitle}>投影颜色</div>
          <div className={styles.textColor}>
            <Popover
              trigger="click"
              overlayClassName="color-picker"
              placement="rightBottom"
              // getTooltipContainer={trigger => trigger}
              destroyTooltipOnHide
              content={
                <div style={{ width: '318px', padding: '10px' }}>
                  <ColorPickup
                    color={values.color}
                    onChange={color => {
                      updateShadow({
                        params: { color: RGBAToString(color.rgb) },
                        target: asset,
                      });
                      clickActionWeblog('Shadow4');
                    }}
                  />
                </div>
              }
            >
              <div
                className="color-block"
                style={{
                  backgroundColor: values.color,
                }}
                onClick={() => {
                  clickActionWeblog('Shadow3');
                }}
              />
            </Popover>
          </div>
        </div>
        {adjustList.map(item => {
          const value = values[item.key] as number;
          const min = item.range[0];
          const max = item.range[1];

          return (
            <AdjustSlider
              key={item.key}
              value={value}
              label={item.label}
              className={item.key}
              onChange={v => {
                const params = { [item.key]: v };
                updateShadow({ params, target: asset });
                changed.current = true;
              }}
              min={min}
              max={max}
              onAfterChange={() => {
                // onAfterChange 实际为 onmouseup，即便没有修改值也会触发
                // 所以这里加个判断，触发过 onChange 后才触发保存
                if (!changed.current) return;
                reportChange('updateShadow', true);
                clickActionWeblog('Shadow1');
                changed.current = false;
              }}
            />
          );
        })}
      </div>
      <div className="image-controller-bottom">
        <div
          className="image-controller-reset"
          onClick={() => {
            updateShadow({
              params: {},
              target: asset,
              save: true,
              replace: true,
            });
            clickActionWeblog('Shadow2');
          }}
        >
          重置
        </div>
      </div>
    </div>
  );
};

export default observer(ShadowPanel);
