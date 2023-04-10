import { useRef } from 'react';
import { getCurrentAsset, observer, updateFilters } from '@hc/editor-core';
import { reportChange } from '@/kernel/utils/config';
import { defaultEffect } from '@/kernel/utils/const';
import SidePanelWrap from '@/components/SidePanelWrap';
import { useSettingPanelInfo } from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';

import { adjustList } from './options';
import styles from './index.less';
import AdjustSlider from '../SideSlider';

const FiltersAdjust = () => {
  const asset = getCurrentAsset();
  const { close } = useSettingPanelInfo();

  const changed = useRef(false);

  if (!asset) return null;

  const {
    attribute: { effectInfo },
  } = asset;

  const values = { ...defaultEffect, ...effectInfo };

  return (
    <SidePanelWrap
      header="图片美化"
      onCancel={close}
      wrapClassName="side-setting-panel"
    >
      <div className={styles.FiltersAdjust}>
        <div className={styles.list}>
          {adjustList.map(item => {
            const {
              range: [min, max],
            } = item;
            const value = values[item.key] as number;

            return (
              <AdjustSlider
                key={item.key}
                value={value}
                label={item.label}
                className={item.key}
                onChange={v => {
                  updateFilters({ params, target: asset });
                  changed.current = true;
                }}
                min={min}
                max={max}
                onAfterChange={() => {
                  // onAfterChange 实际为 onmouseup，即便没有修改值也会触发
                  // 所以这里加个判断，触发过 onChange 后才触发保存
                  if (!changed.current) return;
                  reportChange('updateFilters', true);
                  // clickActionWeblog('Filters3');
                  changed.current = false;
                }}
              />
            );
          })}
        </div>
        <div className={styles.bottom}>
          <div />
          <div
            className={styles.reset}
            onClick={() => {
              updateFilters({
                params: {},
                target: asset,
                replace: true,
                save: true,
              });
              // clickActionWeblog('Filters4');
            }}
          >
            重置
          </div>
        </div>
      </div>
    </SidePanelWrap>
  );
};

export default observer(FiltersAdjust);
