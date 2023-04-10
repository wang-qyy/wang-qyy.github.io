import { useMemo } from 'react';
import { useSetState } from 'ahooks';
import {
  getPicImage,
  getCreativeImage,
  getIllustrationImage,
} from '@/api/images';
import List from './common/List';
import DetailTags from './common/DetailTags';
import styles from './index.less';

const DetailPage = (Props: {
  title: string;
  value: string;
  bindClickback: () => void;
}) => {
  const { title, bindClickback, value } = Props;
  const [state, setState] = useSetState({
    is_portrait: 0,
  });

  // 获取点击标签对应id
  const bindClickTag = (id: number) => {
    setState({
      is_portrait: id,
    });
  };

  const param = useMemo(
    () => ({
      keyword: value,
      page: 1,
      pageSize: 40,
      is_portrait: state.is_portrait,
    }),
    [state.is_portrait, value],
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
        <div className={styles.tagsTop} hidden={title !== '照片'}>
          <DetailTags bindClickTag={bindClickTag} />
        </div>
      </div>

      <List
        title={title}
        styleName="searchPageContent"
        param={param}
        req={
          // eslint-disable-next-line no-nested-ternary
          title === '创意背景'
            ? getCreativeImage
            : title === '插画'
            ? getIllustrationImage
            : getPicImage
        }
      />
    </div>
  );
};

export default DetailPage;
