import { getSearchBack } from '@/api/background';
import InfiniteLoader from '@/components/InfiniteLoader';
import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';
import styles from './index.less';
import List from '../List';

export default function MorePage() {
  const { leftSideInfo, openSidePanel } = useLeftSideInfo();

  const [class_name, type, filter_id, shape] =
    leftSideInfo.submenu?.split('-') || [];

  return (
    <>
      {leftSideInfo.submenu && (
        <div className={styles['more-list']}>
          <div
            className={styles['class-name']}
            onClick={() => {
              openSidePanel();
            }}
          >
            {'<'}
            {class_name}
          </div>
          <InfiniteLoader
            request={getSearchBack}
            params={{
              filter_id,
              shape,
              resource_flag: type == 'VB' ? 'VB' : 'GP',
            }}
            skeleton={{ rows: 5 }}
          >
            {({ list }) => {
              return (
                <List list={list} type={type} shape={shape} isSearch={false} />
              );
            }}
          </InfiniteLoader>
        </div>
      )}
    </>
  );
}
