import styles from '../index.less';
import Item from './Item';

const SimpleShow = (Props: {
  title: string;
  type: string;
  bindClickMore: (title: string, type: string) => void;
  data: any;
}) => {
  const { title, bindClickMore, type, data } = Props;
  const itemArr = data;
  return (
    <div className={styles.simpleShow}>
      <div className={styles.simpleShowTop}>
        <div className={styles.simpleShowTopLeft}>{title}</div>
        <div
          className={styles.simpleShowTopRight}
          onClick={() => bindClickMore(title, type)}
        >
          {'查看更多>'}
        </div>
      </div>

      <div className={styles.simpleShowContent}>
        {itemArr.map((item: any, index: number) => {
          return (
            <div className={styles.item} key={item.id}>
              <Item item={item} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleShow;
