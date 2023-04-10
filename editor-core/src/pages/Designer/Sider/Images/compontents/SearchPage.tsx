import { useMemo } from 'react';
import { useSetState } from 'ahooks';
import { Tabs } from 'antd';
import {
  getPicImage,
  getCreativeImage,
  getIllustrationImage,
} from '@/api/images';
import styles from './index.less';
import List from './common/List';
import DetailTags from './common/DetailTags';

const SearchPage = (Props: { value: string }) => {
  const { value } = Props;
  const { TabPane } = Tabs;
  const [state, setState] = useSetState({
    is_portrait: 0,
  });

  const param = useMemo(
    () => ({
      keyword: value,
      page: 1,
      pageSize: 40,
    }),
    [value],
  ); // 包一层

  const picParam = useMemo(
    () => ({
      keyword: value,
      page: 1,
      pageSize: 40,
      is_portrait: state.is_portrait,
    }),
    [state.is_portrait, value],
  ); // 包一层

  // 获取点击标签对应id
  const bindClickTag = (id: number) => {
    setState({
      is_portrait: id,
    });
  };

  return (
    <div className={styles.searchPage}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="创意背景" key="1">
          <div className={styles.tagsTopWarp}>
            <div className={styles.searchContent}>
              <List
                param={param}
                title="创意背景"
                req={getCreativeImage}
                styleName="searchPageContent"
              />
            </div>
          </div>
        </TabPane>
        <TabPane tab="插画" key="2">
          <div className={styles.tagsTopWarp}>
            <div className={styles.searchContent}>
              <List
                param={param}
                title="插画"
                req={getIllustrationImage}
                styleName="searchPageContent"
              />
            </div>
          </div>
        </TabPane>
        <TabPane tab="照片" key="3">
          <div className={styles.tagsTopWarp}>
            <div className={styles.tagsTop}>
              <DetailTags bindClickTag={bindClickTag} />
            </div>
            <div className={styles.searchContent}>
              <List
                param={picParam}
                title="照片"
                req={getPicImage}
                styleName="searchPageContent"
              />
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SearchPage;
