import { useRequest } from 'ahooks';
import classNames from 'classnames';
import { updateFilters, getCurrentAsset, observer } from '@hc/editor-core';
import { getFiltersList } from '@/api/filters';
import { getRealAsset } from '@/utils/single';
import OverwriteSlider from '@/components/OverwriteSlider';
import { cdnHost } from '@/config/urls';

import Mold from '../../components/Mold';
import './index.less';

function Filters() {
  const asset = getCurrentAsset();

  const realAsset = asset && getRealAsset(asset);
  const resId = realAsset?.attribute.filters?.resId;
  const strong = realAsset?.attribute.filters?.strong;

  const { data = [] } = useRequest(getFiltersList, {
    onError: err => {
      console.log('出错啦！！列表加载失败', err);
    },
  });

  //   设置滤镜
  function setFilter(data: any) {
    updateFilters({
      target: realAsset,
      params: { ...data.filters, resId: data.id },
      replace: true,
      save: true,
    });
  }

  return (
    <div className="filters">
      <div className="filter-list">
        {data.map(item => (
          <Mold key={item.name} title={item.name}>
            {item.name === '基础' && (
              <div className="filter-item">
                <img
                  width="100%"
                  src={`${cdnHost}/img/img_filter/0.jpg`}
                  alt="原色"
                  className={classNames({
                    'filter-item-active': resId === 'origin_',
                  })}
                  onClick={() => {
                    updateFilters({
                      target: realAsset,
                      params: { resId: 'origin_' },
                      replace: true,
                      save: true,
                    });
                  }}
                />
                <div className="filter-name">原色</div>
              </div>
            )}
            {item.items.map(filter => (
              <div key={filter.id} className="filter-item">
                <img
                  width="100%"
                  src={filter.preview_url}
                  alt={filter.name}
                  className={classNames({
                    'filter-item-active': resId === filter.id,
                  })}
                  onClick={() => setFilter(filter)}
                />
                <div className="filter-name">{filter.name}</div>
              </div>
            ))}
          </Mold>
        ))}
      </div>
      <div className="filter-parameter">
        <OverwriteSlider
          label="强度"
          value={Math.round((strong ?? 1) * 100)}
          step={1}
          onChange={value => {
            updateFilters({
              target: realAsset,
              params: {
                ...realAsset?.attribute.filters,
                strong: value / 100,
              },
            });
          }}
          inputNumber
          tooltipVisible={false}
        />
      </div>
    </div>
  );
}

export default observer(Filters);
