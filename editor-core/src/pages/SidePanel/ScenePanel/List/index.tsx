import { memo, useRef } from 'react';
import { encode } from 'js-base64';
import InfiniteLoader, { InfiniteLoaderRef } from '@/components/InfiniteLoader';
import classNames from 'classnames';

import getUrlProps from '@/utils/urlProps';
import { useTemplateInfo } from '@/store/adapter/useTemplateInfo';
import TemplateItem from '../TemplateItem';

import './index.less';

export interface Filters {
  filter?: {
    shape?: string;
    classes?: { g?: number; i?: number; c?: number; d?: number };
  };
  w?: string;
  template_id?: number;
  ratio?: 0 | 1 | 2;
}

interface ListProps {
  filters: Filters;
  request: any;
  type: 'all' | 'collection';
}

const List = ({ filters, request, type }: ListProps) => {
  const listRef = useRef<InfiniteLoaderRef>();
  const urlProps = getUrlProps();

  const {
    templateInfo: { last_templ_id, picId },
  } = useTemplateInfo();

  const template_id = urlProps.picId || picId || last_templ_id;
  return (
    <InfiniteLoader
      manualRequest={false}
      ref={listRef}
      request={request}
      beforeLoadData={params => {
        const { page, filter, ...others } = params;

        return {
          ...others,
          p: page,
          filter: filter ? encode(JSON.stringify(filter)) : '',
        };
      }}
      params={{ template_id, ...filters }}
      skeleton={{ rows: 3, columns: 1, className: 'scene-list-skeleton' }}
      emptyDesc={
        <>
          <p>
            未找到“<span className="empty-keyword">{filters?.w}</span>
            ”相关视频模板
          </p>
          <p>建议更换其他类似关键词搜索</p>
        </>
      }
    >
      {({ list }) => {
        return (
          <div
            className={classNames('scene-list', {
              'scene-list-w':
                filters?.filter?.shape === 'w' || filters.ratio === 1,
            })}
          >
            {list.map(data => {
              return (
                <TemplateItem
                  className={classNames('scene-list-item', {
                    // 'scene-list-item-masonry': masonry,
                    'scene-list-item-w':
                      filters?.filter?.shape === 'w' || filters.ratio === 1,
                  })}
                  key={data.id}
                  data={data}
                  width={150}
                  type={type}
                />
              );
            })}
          </div>
        );
      }}
    </InfiniteLoader>
  );
};

export default memo(List);
