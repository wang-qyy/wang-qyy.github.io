import React from 'react';
import { observer } from 'mobx-react';
import { Filters } from '@/kernel/typing';
import { defaultFilters } from '@/kernel/utils/const';
import Filter from './Filter';
import { getFilterId } from './options';

interface IProps {
  src: string;
  style: React.CSSProperties;
  filters?: Partial<Filters>; // 用户调整值
  preset?: Partial<Filters>; // 预设
}

const ImageWithFilters = (props: IProps) => {
  const { src = '', style, filters, preset } = props;

  const mergedFilter = { ...defaultFilters, ...filters };
  const mergedPresetFilter = { ...defaultFilters, ...preset };

  const filterId = getFilterId(mergedFilter);
  const presetFilterId = getFilterId(mergedPresetFilter);

  return (
    <div style={style}>
      <svg
        // version="1.1"
        preserveAspectRatio="none"
        // xmlns="http://www.w3.org/2000/svg"
        // xmlnsXlink="http://www.w3.org/1999/xlink"
        width="100%"
        height="100%"
      >
        <defs>
          {filterId && <Filter filterId={filterId} filters={mergedFilter} />}
          {presetFilterId && (
            <Filter filterId={presetFilterId} filters={mergedPresetFilter} />
          )}
        </defs>

        <g filter={filters ? `url(#${filterId})` : undefined}>
          <g filter={preset ? `url(#${presetFilterId})` : undefined}>
            <image
              width="100%"
              height="100%"
              // preserveAspectRatio="xMidYMid slice"
              xlinkHref={src}
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

ImageWithFilters.defaultProps = {
  filters: undefined,
  preset: undefined,
};

export default observer(ImageWithFilters);
