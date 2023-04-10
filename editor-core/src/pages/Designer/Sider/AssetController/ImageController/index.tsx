import { useRef } from 'react';
import { getCurrentAsset, observer, updateFilters } from '@hc/editor-core';
import { adjustList } from '@/pages/SidePanel/FiltersAdjust/options';
import { getRealAsset } from '@/utils/single';
import { defaultFilters } from '@/kernel/utils/const';

import AdjustSlider from '../../Slider';
import './index.less';

/**
 * 图片美化
 * */
function ImageController() {
  const changed = useRef(false);

  const asset = getCurrentAsset();
  if (!asset) return null;
  const realAsset = asset && getRealAsset(asset);
  const {
    attribute: { filters },
  } = realAsset;

  const values = { ...defaultFilters, ...filters };

  return (
    <div className="image-controller">
      <div
        className="image-controller-list"
        style={{ color: '#fff', fontSize: 12 }}
      >
        {adjustList.map(item => {
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
              onChange={v => {
                // 同 ㈠
                const newValue =
                  Math.floor(
                    (((v - sliderMin) / (sliderMax - sliderMin)) * (max - min) +
                      min) *
                      10000,
                  ) / 10000;
                const params = { [item.key]: newValue, resId: '' };
                updateFilters({ target: realAsset, params });
                changed.current = true;
              }}
              min={sliderMin}
              max={sliderMax}
              onAfterChange={() => {
                // onAfterChange 实际为 onmouseup，即便没有修改值也会触发
                // 所以这里加个判断，触发过 onChange 后才触发保存
                changed.current = false;
              }}
            />
          );
        })}
      </div>

      <div className="image-controller-bottom">
        <div
          className="image-controller-reset"
          onClick={() =>
            updateFilters({
              target: realAsset,
              params: { ...defaultFilters, resId: '' },
              save: true,
            })
          }
        >
          重置
        </div>
      </div>
    </div>
  );
}

export default observer(ImageController);
