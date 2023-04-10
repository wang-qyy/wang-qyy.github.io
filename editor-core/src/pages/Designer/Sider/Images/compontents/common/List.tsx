import { useEffect, memo } from 'react';
import { useSetState, useRequest } from 'ahooks';
import { XiuIcon } from '@/components';
import InfiniteLoader from '@/components/InfiniteLoader';

import Item from './Item';
import styles from '../index.less';

interface State {
  itemArr: any;
  page: number;
  pageTotal: number;
  isShow: boolean;
}
const List = (Props: {
  param: any;
  styleName: string;
  title: string;
  req: any;
}) => {
  const { param, styleName, title, req } = Props;
  const [state, setState] = useSetState<State>({
    itemArr: [],
    page: 0,
    pageTotal: 0,
    isShow: false,
  });

  const { loading, run } = useRequest(req, {
    manual: true,
    onSuccess: (res, params) => {
      const { items, pageTotal, page } = res;

      let newData: Array<{}> = [];

      if (items.length > 0) {
        newData = page !== 1 ? [...state.itemArr, ...items] : [...items];
      }
      const isShow = newData.length > 0;

      setState({
        itemArr: newData,
        page,
        pageTotal,
        isShow,
      });
    },
    onError: err => {
      console.log('出错啦！！列表加载失败', err);
    },
  });

  const loadData = (obj: any) => {
    run(obj);
  };

  useEffect(() => {
    setState({
      itemArr: [],
      page: 0,
    });
    run(param);
  }, [param]);

  return (
    <InfiniteLoader
      request={req}
      params={param}
      emptyDesc={
        <div className={styles.emptyWarp}>
          <XiuIcon type="iconkong" className={styles.img} />
          {`未搜索到${
            param?.keyword ? `与“${param?.keyword}”` : ''
          }相关${title}`}
        </div>
      }
      wrapStyle={{ flex: 1, height: 0 }}
      skeleton={{
        style: {
          paddingTop: 2,
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill,minmax(98px,1fr))',
          alignContent: 'flex-start',
        },
      }}
    >
      {({ list }) => {
        return (
          <>
            {list.map((item: any) => {
              return (
                <div className={styles.item} key={item.id}>
                  <Item item={item} />
                </div>
              );
            })}
          </>
        );
      }}
    </InfiniteLoader>
  );
};

export default memo(List);
