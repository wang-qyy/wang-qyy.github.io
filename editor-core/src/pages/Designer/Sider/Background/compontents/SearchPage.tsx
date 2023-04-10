import { useState, useMemo } from 'react';
import { useSetState } from 'ahooks';
import { Tabs } from 'antd';
import { getBackgroundVideo, getBackgroundImage } from '@/api/background';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import styles from './index.less';
import List from './List';
import DetailTags from './common/DetailTags';

const SearchPage = (Props: { value: string }) => {
  const { value } = Props;
  const { TabPane } = Tabs;
  const [screenShow, setScreenShow] = useState(false);
  const [state, setState] = useSetState({
    classifyId: '',
    class_id: '',
    tag_id: '',
    ratio: '',
    screenShow: false,
  });

  const param = useMemo(
    () => ({
      keyword: value,
      page: 1,
      pageSize: 40,
      class_id: state.class_id,
      tag_id: state.tag_id,
      ratio: state.ratio,
    }),
    [state.class_id, state.tag_id, state.ratio, value],
  ); // 包一层

  const videoParam = useMemo(
    () => ({
      keyword: value,
      page: 1,
      pageSize: 40,
      class_id: state.classifyId,
    }),
    [state.classifyId, value],
  ); // 包一层

  // 获取点击标签对应id
  const bindClickTag = (type: string, id: number | string) => {
    setState({
      [type]: id,
    });
  };

  const bindClickTag2 = (type: string, id: any) => {
    setState({
      classifyId: id,
    });
  };
  const bindClickScreen = () => {
    setScreenShow(!screenShow);
  };
  return (
    <div className={styles.searchPage}>
      <Tabs
        defaultActiveKey="1"
        tabBarExtraContent={
          <div className={styles.searchPageScreen} onClick={bindClickScreen}>
            分类筛选
            {screenShow ? <CaretUpOutlined /> : <CaretDownOutlined />}
          </div>
        }
      >
        <TabPane tab="视频背景" key="1">
          <div className={styles.tagsTopWarp}>
            <div className={styles.tagsTop}>
              <div style={{ display: screenShow ? 'block' : 'none' }}>
                <DetailTags title="视频背景" bindClickTag={bindClickTag2} />
              </div>
            </div>

            <div className={styles.searchContent}>
              <List param={videoParam} type="video" req={getBackgroundVideo} />
            </div>
          </div>
        </TabPane>
        <TabPane tab="图片背景" key="2">
          <div className={styles.tagsTopWarp}>
            <div className={styles.tagsTop}>
              <div style={{ display: screenShow ? 'block' : 'none' }}>
                <DetailTags title="图片背景" bindClickTag={bindClickTag} />
              </div>
            </div>
            <div className={styles.searchContent}>
              <List param={param} type="pic" req={getBackgroundImage} />
            </div>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SearchPage;
