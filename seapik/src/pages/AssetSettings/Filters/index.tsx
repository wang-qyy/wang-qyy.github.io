import { useEffect } from 'react';
import classNames from 'classnames';
import { Spin } from 'antd';
import { useRequest } from 'ahooks';
import { AssetClass, updateFilters, observer, Filters } from '@/kernel';
import IconFont from '@/components/Icon';
import { getImageFilters } from '@/apis/global';
import FabricFilter from '@/components/FabricFilter';
import { getUrl } from '@/pages/store/canvas';

import './index.less';

interface FilterClasses {
  name: string;
  items: FilterData[];
}

interface FilterData {
  id: string;
  name: string;
  preview_url: string;
  filters: Filters;
}

const Filter = ({ asset }: { asset: AssetClass }) => {
  const { data, run, loading } = useRequest(getImageFilters, { manual: true });

  function setAssetFilter(id: string, filters: Partial<Filters> = {}) {
    updateFilters({
      params: { ...filters, resId: id },
      replace: true,
      target: asset,
      save: true,
    });
  }

  useEffect(() => {
    run();
  }, []);

  const image = getUrl();

  return (
    <Spin spinning={loading} wrapperClassName="filters-spinning">
      {data?.data?.map((cl: FilterClasses, index: number) => (
        <div key={cl.name}>
          <label className="filters-label">{cl.name}</label>
          <div className="filters mb-16">
            {index === 0 && (
              <div
                className={classNames('filters-item', 'filters-item-clear', {
                  'filters-item-active':
                    asset.attribute.filters?.resId === 'origin_',
                })}
                onClick={() => setAssetFilter('origin_')}
                draggable={false}
              >
                <IconFont type="icondisable" />
              </div>
            )}
            {cl.items.map((opt: FilterData) => (
              <div
                key={opt.id}
                className={classNames('filters-item', {
                  'filters-item-active':
                    asset.attribute.filters?.resId === opt.id,
                })}
                draggable={false}
                onClick={() => setAssetFilter(opt.id, opt.filters)}
              >
                <FabricFilter
                  src={image}
                  style={{ width: 58, height: 58 }}
                  filters={opt.filters}
                />
                {/* <img
                  src={opt.preview_url}
                  width="100%"
                  onClick={() => setAssetFilter(opt.id, opt.filters)}
                  draggable={false}
                /> */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </Spin>
  );
};
export default observer(Filter);
