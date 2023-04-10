import { PropsWithChildren, useState } from 'react';
import { getVideoEEffectList } from '@/api/videoE';
import Skeleton from '@/components/Skeleton';

import InfiniteLoader from '@/components/InfiniteLoader';
import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';
import Item from '../Item';
import styles from './index.modules.less';

interface MoreProps {
  keyword?: string;
  hasTitle?: boolean;
  action?: string;
  ratio?: string; // 视频比例
  class_id?: string | number;
}

export default function More({
  keyword,
  hasTitle = true,
  ratio,
  class_id,
  action = 'videoEffect_add',
}: PropsWithChildren<MoreProps>) {
  const { leftSideInfo, openSidePanel } = useLeftSideInfo();
  const [class_name = '', moreClass_id = ''] =
    leftSideInfo.submenu?.split('-') || [];
  const [length, setLength] = useState(0);
  return (
    <div
      className={styles['more-list']}
      style={class_id ? {} : { paddingBottom: 40 }}
    >
      {hasTitle && (
        <div
          className={styles['class-name']}
          onClick={() => {
            openSidePanel();
          }}
        >
          {'<'}
          {class_name}
        </div>
      )}
      {keyword && (
        <div className={styles.keyword}>
          “{keyword}”相关共{length}个
        </div>
      )}
      <InfiniteLoader
        request={getVideoEEffectList}
        beforeLoadData={params => params}
        params={{
          class_id: class_id ?? moreClass_id,
          keyword,
          ratio,
          pageSize: 30,
        }}
        skeleton={{ rows: 5 }}
        onChange={list => {
          setLength(list.length);
        }}
      >
        {({ list }) => {
          return (
            <>
              <div
                style={{
                  display: 'grid',
                  gap: 16,
                  gridTemplateColumns: 'repeat(auto-fill, 148px)',
                }}
              >
                {list.map(item => (
                  <Item
                    key={item.gid}
                    data={item}
                    class_id={class_id ?? moreClass_id}
                    action={action}
                  />
                ))}
              </div>
            </>
          );
        }}
      </InfiniteLoader>
    </div>
  );
}
