import React from 'react';
import { useDebounceFn, useRequest } from 'ahooks';
import classNames from 'classnames';
import { getCurrentAsset, observer, updateFilters } from '@hc/editor-core';
import { getFiltersList } from '@/api/filters';
import SidePanelWrap from '@/components/SidePanelWrap';
import OverwriteSlider from '@/components/OverwriteSlider';
import { useSettingPanelInfo } from '@/store/adapter/useGlobalStatus';
import { getRealAsset } from '@/utils/single';

import { clickActionWeblog } from '@/utils/webLog';
import { reportChange } from '@/kernel/utils/config';
import { cdnHost } from '@/config/urls';

import styles from './index.less';

const Filters = () => {
  const asset = getCurrentAsset();

  const realAsset = asset && getRealAsset(asset);
  const resId = realAsset?.attribute.filters?.resId;
  const strong = realAsset?.attribute.filters?.strong;
  const { close } = useSettingPanelInfo();

  const { data = [] } = useRequest(getFiltersList, {
    onError: err => {
      console.log('出错啦！！列表加载失败', err);
    },
  });

  const checkHasActive = (
    list: any[],
    index: number,
    categoryIndex: number,
  ) => {
    let hasActive = false;
    // 如果是第一个类目，则Index往右偏移1，因为第一个类目多了个 原色
    const offset = categoryIndex ? 0 : 1;

    // 每行最后一位
    if ((index + 1 + offset) % 4 === 0 || index === list.length - 1) {
      const resIndex = list.findIndex(t => t.id === resId);
      // 该list没有被选中
      if (resIndex === -1) return hasActive;
      // 在同一行
      if (Math.floor((resIndex + offset) / 4) === Math.floor(index / 4)) {
        hasActive = true;
      }
    }
    return hasActive;
  };

  const { run } = useDebounceFn(
    () => {
      reportChange('updateFilters', true);
      clickActionWeblog('Filters2');
    },
    {
      wait: 50,
    },
  );

  return (
    <SidePanelWrap
      header="图片滤镜"
      onCancel={close}
      wrapClassName="side-setting-panel"
    >
      <div className={styles.Filters}>
        <div className={styles.content}>
          {data.map((category, categoryIndex) => (
            <div key={category.name} className={styles.category}>
              <div className={styles.title}>{category.name}</div>
              <div className={styles.list}>
                {category.items.map((item, index) => {
                  const hasActive = checkHasActive(
                    category.items,
                    index,
                    categoryIndex,
                  );
                  const isFirst = !categoryIndex && !index;

                  return (
                    <React.Fragment key={item.id}>
                      {!!isFirst && (
                        <div className={styles.item}>
                          <div
                            className={classNames(styles.img, {
                              [styles.active]: resId === 'origin_',
                            })}
                            onClick={() => {
                              updateFilters({
                                params: { resId: 'origin_' },
                                replace: true,
                                target: realAsset,
                                save: true,
                              });
                            }}
                            style={{
                              backgroundImage: `url(${cdnHost}/img/img_filter/0.jpg)`,
                            }}
                          />
                          <div className={styles.name}>原色</div>
                        </div>
                      )}
                      <div className={styles.item}>
                        <div
                          className={classNames(styles.img, {
                            [styles.active]: resId === item.id,
                          })}
                          onClick={() => {
                            updateFilters({
                              params: { ...item.filters, resId: item.id },
                              replace: true,
                              target: realAsset,
                              save: true,
                            });
                            clickActionWeblog('Filters1');
                          }}
                          style={{
                            backgroundImage: `url(${item.preview_url})`,
                          }}
                        />
                        <div className={styles.name}>{item.name}</div>
                      </div>
                      {hasActive && (
                        <OverwriteSlider
                          label="强度"
                          value={Math.round((strong ?? 1) * 100)}
                          onChange={value => {
                            updateFilters({
                              params: { strong: value / 100 },
                              target: realAsset,
                            });
                            run();
                          }}
                          inputNumber
                          style={{ paddingRight: 20, marginBottom: 10 }}
                          tooltipVisible={false}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidePanelWrap>
  );
};

export default observer(Filters);
