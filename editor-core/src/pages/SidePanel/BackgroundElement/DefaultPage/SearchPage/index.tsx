import { PropsWithChildren, useEffect } from 'react';
import { getSearchBack, getSubFilter } from '@/api/background';
import { useRequest } from 'ahooks';
import InfiniteLoader from '@/components/InfiniteLoader';
import SearchBar from '../Tag';
import styles from './index.less';
import List from '../../List';

interface MoreProps {
  params: any;
  type: string;
  bindClickTag: (id: string, type: string) => void;
}

function SearchPage({
  params,
  type,
  bindClickTag,
}: PropsWithChildren<MoreProps>) {
  const { data, loading } = useRequest(getSubFilter, {
    defaultParams: [type == 'VB' ? '1230805' : '1230809'],
  });

  return (
    <div className={styles.searchPage}>
      {/* <div className={styles.searchPageSearchBar}>
        <SearchBar
          bindClickTag={bindClickTag}
          type={type}
          data={data || []}
          lable="全部"
        />
      </div> */}
      <div className={styles.searchPageContent}>
        <InfiniteLoader
          request={getSearchBack}
          params={{
            ...params,
          }}
          skeleton={{ rows: 5 }}
          emptyDesc={
            <>
              <p>
                没有搜索到“
                <span className={styles['empty-keyword']}>
                  {params?.keyword}
                </span>
                ”的相关背景
              </p>
              <p className={styles.emptyTxt}>您可以尝试更换关键词来搜索</p>
            </>
          }
        >
          {({ list }) => {
            return (
              <List list={list} type={type} shape={params.shape} isSearch />
            );
          }}
        </InfiniteLoader>
      </div>
    </div>
  );
}

export default SearchPage;
