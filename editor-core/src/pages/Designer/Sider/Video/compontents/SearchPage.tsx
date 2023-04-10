import { useMemo, memo } from 'react';
import { Tabs } from 'antd';
import { getVideo } from '@/api/video';
import styles from './index.less';
import List from './List';

const SearchPage = (Props: { value: string; minVideoArr: any }) => {
  const { value, minVideoArr } = Props;
  const { TabPane } = Tabs;
  const param = useMemo(
    () => ({
      keyword: value,
      page: 1,
      pageSize: 40,
    }),
    [value],
  ); // 包一层

  return (
    <div className={styles.searchPage}>
      <Tabs defaultActiveKey="1">
        {minVideoArr &&
          minVideoArr.map((item: any) => {
            return (
              <TabPane tab={item.title} key={item.type}>
                <div className={styles.tagsTopWarp}>
                  <div className={styles.tagsTop} />
                  <div className={styles.searchContent}>
                    <List
                      param={{ ...param, type: item.type }}
                      title={item.title}
                      req={getVideo}
                    />
                  </div>
                </div>
              </TabPane>
            );
          })}
      </Tabs>
    </div>
  );
};

export default memo(SearchPage);
