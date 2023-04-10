import { useRef } from 'react';
import { observer, updateFilters, AssetClass } from '@/kernel';
import { reportChange } from '@/kernel/utils/config';
import { defaultFilters } from '@/kernel/utils/const';

import { adjustList } from './options';
import AdjustSlider from './SideSlider';
import styles from './index.less';

const FiltersAdjust = ({ asset }: { asset: AssetClass }) => {
  const changed = useRef(false);

  const {
    attribute: { filters },
  } = asset;

  const values = { ...defaultFilters, ...filters };

  return (
    <div className={styles.FiltersAdjust}>
      <div className={styles.list}>
        {adjustList.map((item) => {
          const {
            range: [min, max],
            sliderRange: [sliderMin, sliderMax],
          } = item;
          const value = values[item.key] as number;

          // ㈠  每个滤镜的实际范围和 slider 组件的范围不一样，需要根据每个滤镜的区间值做个换算
          // 具体参考 adjustItem 的类型
          const sliderValue = Math.round(
            ((value - min) / (max - min)) * (sliderMax - sliderMin) + sliderMin,
          );

          return (
            <AdjustSlider
              key={item.key}
              value={Math.min(sliderValue, sliderMax)}
              label={item.label}
              className={item.key}
              onChange={(v) => {
                // 同 ㈠
                const newValue =
                  Math.floor(
                    (((v - sliderMin) / (sliderMax - sliderMin)) * (max - min) +
                      min) *
                      10000,
                  ) / 10000;
                const params = { [item.key]: newValue, resId: '' };
                updateFilters({ params, target: asset });
                changed.current = true;
              }}
              min={sliderMin}
              max={sliderMax}
              onAfterChange={() => {
                // onAfterChange 实际为 onmouseup，即便没有修改值也会触发
                // 所以这里加个判断，触发过 onChange 后才触发保存
                if (!changed.current) return;
                reportChange('updateFilters', true);
                changed.current = false;
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default observer(FiltersAdjust);
