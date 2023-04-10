import { memo, useState } from 'react';
import classNames from 'classnames';
import InfiniteLoader from '@/components/InfiniteLoader';
import SidePanelWrap from '@/components/SidePanelWrap';
import TemplateItem from '../TemplateItem';
import RatioRadio from '../RatioRadio';

import './index.less';

export interface Filters {
  filter?: {
    shape?: string;
    classes?: { g?: number; i?: number; c?: number; d?: number };
  };
  w?: string;
  template_id?: number;
}

interface ListProps {
  request: any;
  beforeReplace: any;
}

const List = ({ request, beforeReplace }: ListProps) => {
  const [ratio, setRatio] = useState(1);

  return (
    <SidePanelWrap
      search={
        <RatioRadio
          active={ratio}
          onChange={value => {
            setRatio(value.key);
          }}
        />
      }
    >
      <InfiniteLoader
        request={request}
        params={{ ratio }}
        masonry={false}
        skeleton={{ rows: 3, columns: 1, className: 'draft-list-skeleton' }}
      >
        {({ list }) => {
          return (
            <div
              className={classNames('draft-list', {
                'draft-list-w': ratio === 1,
              })}
            >
              {list.map(item => (
                <TemplateItem
                  className="draft-item"
                  data={item}
                  width={ratio === 1 ? 314 : 150}
                  beforeReplace={data =>
                    beforeReplace({ ...data, pages: data.total_duration })
                  }
                  key={item.id}
                  type="draft"
                />
              ))}
            </div>
          );
        }}
      </InfiniteLoader>
    </SidePanelWrap>
  );
};

export default memo(List);
