import { useMemo } from 'react';
import { getVideo } from '@/api/video';
import styles from './index.less';
import List from './List';

const DetailPage = (Props: {
  title: string;
  type: string;
  value: string;
  bindClickback: () => void;
}) => {
  const { title, bindClickback, value, type } = Props;

  const param = useMemo(
    () => ({
      keyword: value,
      page: 1,
      pageSize: 40,
      type,
    }),
    [value],
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
      </div>

      <List title={title} param={param} req={getVideo} />
    </div>
  );
};

export default DetailPage;
