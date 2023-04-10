import { Empty } from 'antd';
import { useRequest, useSize } from 'ahooks';
import {
  useImperativeHandle,
  useRef,
  ReactElement,
  PropsWithoutRef,
  forwardRef,
  ReactNode,
  useState,
  CSSProperties,
  Ref,
  useEffect,
} from 'react';
import { stringify } from 'qs';
import classNames from 'classnames';

import { minigrid } from '@/utils/minigrid';
import emptyImg from '@/assets/image/empty.png';
import { ossPath } from '@/config/urls';

import Skeleton, { XiuddSkeletonProps } from '@/components/Skeleton';

import useDeepCompareEffect from './useDeepCompareEffect';

import './index.less';

interface Result {
  pageTotal: number;
  page: number;
  list: any[];
}

interface InfiniteLoaderChildrenFn {
  list: any[];
  isNoMore?: boolean;
}
export interface InfiniteLoaderRef {
  reload: (params?: any) => void;
  refresh: () => void;
  masonryUpdate: Function;
}
export interface InfiniteLoaderProps {
  request: Function;
  formatResult?: (response: any) => {
    list: Array<{}>;
    page?: number;
    pageTotal: number;
  };
  beforeLoadData?: (
    params: any,
  ) => boolean | number | { [key: string]: number | string }; // return false 阻止列表请求
  manualRequest?: boolean; // 是否手动触发第一次请求, 默认 true
  masonry?: { containerSelector: string; itemSelector: string } | false; // 瀑布流布局
  pollingInterval?: number; // 是否轮询
  children: (params: InfiniteLoaderChildrenFn) => ReactElement<HTMLElement>;
  ready?: boolean;
  defaultParams?: any;
  emptyDesc?: ReactNode;
  params?: any;
  className?: string;
  style?: CSSProperties;
  wrapStyle?: CSSProperties;
  layout?: 'flex' | 'masonry'; // 支持两种布局 flex \ masonry瀑布流
  gap?: number; // layout 设为flex时有效
  isEmpty?: boolean;
  skeleton?: XiuddSkeletonProps;
  isSkeleton?: Boolean;
  onChange?: (list: any[]) => void;
}

const InfiniteLoader = (
  props: PropsWithoutRef<InfiniteLoaderProps>,
  ref: Ref<unknown>,
) => {
  const {
    request,
    children,
    masonry = false,
    beforeLoadData,
    ready = true,
    defaultParams,
    manualRequest,
    formatResult,
    emptyDesc,
    params,
    className,
    wrapStyle,
    isEmpty = true,
    skeleton,
    isSkeleton = true,
    onChange,
    ...others
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(0);
  const { data, loading, loadingMore, reload, loadMore, noMore, run } =
    useRequest(
      (d: Result | undefined) => {
        let payload = {
          ...params,
          page: d ? (d?.page ? d.page + 1 : page + 1) : 1,
        };

        setPage(payload.page);

        if (beforeLoadData) {
          payload = beforeLoadData(payload);
        }

        return request(payload);
      },
      {
        ready,
        manual: manualRequest,
        defaultParams: [defaultParams],
        onSuccess: response => { },
        formatResult: (result: any) => {
          if (formatResult) {
            return formatResult(result);
          }
          return {
            list: result.data.items,
            pageTotal: result.data.pageTotal,
            page: result.data.page,
          };
        },
        loadMore: true,
        ref: containerRef,
        isNoMore: d => {
          return d ? (d.page || page) >= d.pageTotal : false;
        },
        refreshDeps: [stringify(params)],
      },
    );

  //  执行瀑布流布局
  function executeMinigrid() {
    if (masonry) {
      minigrid(masonry.containerSelector, masonry.itemSelector);
    }
  }
  useImperativeHandle(ref, () => ({
    reload,
    refresh: run,
    masonryUpdate: executeMinigrid,
    getData() {
      return data?.list;
    },
  }));

  const { list = [] } = data || {};

  // 瀑布流
  useDeepCompareEffect(() => {
    if (list.length > 0) {
      executeMinigrid();
    }

    onChange && onChange(list);
  }, [list, list.length]);

  useEffect(() => {
    // console.log({ loading, loadingMore });
  }, [loading, loadingMore]);

  return (
    <div className="infinite-loader-wrap" style={wrapStyle}>
      <div
        ref={containerRef}
        className={classNames('infinite-loader', className)}
        {...others}
      >
        {isSkeleton ? (
          <Skeleton {...skeleton} loading={loading}>
            {children({ list })}
          </Skeleton>
        ) : (
          children({ list })
        )}

        <div
          style={{ position: 'absolute', top: 0, width: '100%' }}
          hidden={loading || loadingMore}
        >
          {isEmpty && list.length < 1 && !loading && !loadingMore && (
            <Empty
              className="empty-wrap"
              image={ossPath('/image/Icon/1662431803098.png')}
              description={
                <div className="empty-desc">{emptyDesc || '暂无数据'}</div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default forwardRef(InfiniteLoader);
