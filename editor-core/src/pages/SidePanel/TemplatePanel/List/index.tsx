import { memo, useEffect, useRef, useState } from 'react';
import { encode } from 'js-base64';
import InfiniteLoader, { InfiniteLoaderRef } from '@/components/InfiniteLoader';
import classNames from 'classnames';
import { useSize } from 'ahooks';

import getUrlProps from '@/utils/urlProps';
import { useTemplateInfo } from '@/store/adapter/useTemplateInfo';
import TemplateItem from '../TemplateItem';

import type { TemplateListItem } from '../typing';

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
  beforeReplace: (data: TemplateListItem) => void;
  request: any;
  type: 'template' | 'collection';
}

const urlProps = getUrlProps();

const List = ({ filters, beforeReplace, request, type }: ListProps) => {
  const listRef = useRef<InfiniteLoaderRef>();
  const { width = 0 } = useSize(
    document.querySelector('.template-list') as HTMLDivElement,
  );

  const {
    templateInfo: { last_templ_id, picId },
  } = useTemplateInfo();
  const template_id = urlProps.picId || picId || last_templ_id;
  const [templateId, setTemplateId] = useState<Number>(template_id);

  const masonry =
    filters?.filter?.shape === 'w'
      ? false
      : {
          containerSelector: '.template-list',
          itemSelector: '.template-list-item',
        };

  // 防止不可见状态下更新数据瀑布流错乱
  useEffect(() => {
    if (width > 0) {
      setTemplateId(Number(template_id));
    }
  }, [width, template_id]);

  return (
    <InfiniteLoader
      manualRequest={false}
      ref={listRef}
      request={request}
      masonry={masonry}
      beforeLoadData={params => {
        const { page, filter, ...others } = params;

        return {
          ...others,
          p: page,
          filter: filter ? encode(JSON.stringify(filter)) : '',
        };
      }}
      params={{ template_id: templateId, ...filters }}
      skeleton={{ rows: 3, columns: 1, className: 'template-list-skeleton' }}
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
            className={classNames('template-list', {
              'template-list-w':
                filters?.filter?.shape === 'w' || filters.ratio === 1,
            })}
          >
            {list.map(data => {
              return (
                <TemplateItem
                  className={classNames('template-list-item', {
                    'template-list-item-masonry': masonry,
                    'template-list-item-w':
                      filters?.filter?.shape === 'w' || filters.ratio === 1,
                  })}
                  key={data.id}
                  data={data}
                  width={
                    filters?.filter?.shape === 'w' || filters.ratio === 1
                      ? 314
                      : 150
                  }
                  beforeReplace={beforeReplace}
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
