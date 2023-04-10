import { useEffect, useRef, useState } from 'react';
import { Empty } from 'antd';
import { useRequest, useSetState, useDebounceFn } from 'ahooks';

import Search from '@/components/Search';
import {
  assetLabelList,
  getHistoryRecord,
  addHistoryRecord,
} from '@/api/pictures';
import { clickActionWeblog } from '@/utils/webLog';
import { getUserId } from '@/store/adapter/useUserInfo';
import Skeleton from '@/components/Skeleton';

import emptyImg from '@/assets/image/empty.png';
import CloudElementList from './list';

import CloudElementCatalog from './type';

import ElementCatalogRow from './ecRow';
import styles from './index.less';
import FreeformDraw from './FreeformDraw';

const PNGElement = () => {
  const inpRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useSetState({
    page: 1,
    pageSize: 30,
    totalPage: 1,
    data: [],
    imgData: [],
    moreKey: '',
    class_id: '',
    keyword: '',
    shapeList: [],
    search_type: '', // 元素类型：svg=svg，mask=蒙版，image=图片，gif=gif动图，lottie=Lottie动画
  });
  const { moreKey, keyword } = state;

  // 获取元素列表
  const {
    data: { other: labelList, recommend } = { other: [], recommend: [] },
    loading,
  } = useRequest(assetLabelList);

  // 获取最近使用记录
  const {
    // data: { items: historyRecord = [] } = { items: {} },
    data,
    run: getHistory,
  } = useRequest(getHistoryRecord, { manual: true });

  const historyRecord = data?.items || [];

  const { run } = useDebounceFn(
    value => {
      setState(value);
    },
    {
      wait: 500,
    },
  );

  // 点击更多获取图片列表
  const getMore = (e: any) => {
    clickActionWeblog('action_more', { action_label: `element_${e.id}` });

    inpRef.current.state.value = '';
    setState({
      search_type: e.asset_type,
      moreKey: e.class_name,
      imgData: [],
      class_id: e.id,
      keyword: '',
    });
  };
  // 切换类型获取图片列表
  const bindChangeType = (e: any) => {
    setState({
      search_type: e,
      imgData: [],
    });
  };

  async function onAddSuccess(params: any) {
    if (getUserId() > -1) {
      await addHistoryRecord({
        id: params.id,
        asset_type: params.asset_type,
      });
      // 更新最近使用列表
      getHistory();
    }
  }

  useEffect(() => {
    if (getUserId() > -1) {
      getHistory();
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column',
        height: '100%',
        paddingBottom: 16,
      }}
    >
      <Search
        ref={inpRef}
        searchKey="keyword"
        onChange={({ keyword }) => {
          const sign = keyword ? 'asset' : '';
          run({
            ...state,
            imgData: [],
            keyword,
            search_type: sign,
            moreKey: keyword,
          });
        }}
        placeholder="搜索元素"
      />

      {moreKey === '' ? (
        <div className={styles.list}>
          {/* 推荐分类 */}
          <Skeleton loading={loading} columns={4}>
            <CloudElementCatalog
              data={recommend}
              onChange={val => {
                clickActionWeblog('action_element_recommend', {
                  action_label: val.asset_type,
                });
                getMore(val);
              }}
            />
          </Skeleton>

          {/* 自由绘制 */}
          <FreeformDraw />

          {/* 普通的分类展示 */}
          <Skeleton
            loading={loading}
            columns={3}
            rows={3}
            title
            more
            style={{ marginTop: 16 }}
          >
            {[
              {
                class_name: '最近使用',
                asset_type: 'used',
                assetList: historyRecord,
              },
              ...labelList,
            ].map(
              (item: any) =>
                !!item.assetList.length && (
                  <ElementCatalogRow
                    item={item}
                    key={`element-${item.id}`}
                    getMore={() => getMore(item)}
                    onAfterAdd={onAddSuccess}
                  />
                ),
            )}
          </Skeleton>
        </div>
      ) : (
        //  搜索
        <CloudElementList
          keyword={keyword}
          state={state}
          goBack={getMore}
          bindChangeType={bindChangeType}
          onAfterAdd={onAddSuccess}
        />
      )}
    </div>
  );
};

export default PNGElement;
