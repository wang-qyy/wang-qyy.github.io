import { useMemo } from 'react';
import { useSetState } from 'ahooks';
import { getBackgroundVideo, getBackgroundImage } from '@/api/background';
import styles from './index.less';
import List, { ItemType } from './List';
import DetailTags from './common/DetailTags';

export { ItemType };

const DetailPage = (Props: {
  title: string;
  value: string;
  bindClickback: () => void;
  type: ItemType;
}) => {
  const { title, bindClickback, value, type } = Props;
  const [state, setState] = useSetState({
    class_id: '',
    tag_id: '',
    ratio: '',
  });

  // 获取点击标签对应id
  const bindClickTag = (type: string, id: number | string) => {
    setState({
      [type]: id,
    });
  };

  const param = useMemo(
    () => ({
      keyword: value,
      page: 1,
      pageSize: 40,
      class_id: state.class_id,
      tag_id: state.tag_id,
      ratio: state.ratio,
      type: title === '组件背景' ? 'module' : '',
    }),
    [state.class_id, state.tag_id, state.ratio, value],
  ); // 包一层

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailPageT}>
        <div className={styles.detailPageTop}>
          <div className={styles.detailPageTopLeft}>{title}</div>
          <div className={styles.detailPageTopRight} onClick={bindClickback}>
            {'<返回'}
          </div>
        </div>
        <DetailTags title={title} bindClickTag={bindClickTag} />
      </div>

      <List
        param={param}
        req={title === '视频背景' ? getBackgroundVideo : getBackgroundImage}
        style={{ height: 0, flex: 1 }}
        type={type}
      />
    </div>
  );
};

export default DetailPage;
