import Mold from '../../../components/Mold';
import Item from './Item';
import styles from '../index.less';

const SimpleShow = (Props: {
  title: string;
  bindClickMore: (title: string) => void;
  data: any;
}) => {
  const { title, bindClickMore, data } = Props;
  const itemArr = data;

  return (
    <Mold
      title={title}
      extraContent={
        <div className={styles.more} onClick={() => bindClickMore(title)}>
          {'查看更多>'}
        </div>
      }
      contentStyle={{
        gridTemplateColumns: 'repeat(auto-fill,minmax(98px,1fr))',
      }}
    >
      {itemArr.map((item: any, index: number) => {
        return (
          <div className={styles.item} key={item.id}>
            <Item item={item} />
          </div>
        );
      })}
    </Mold>
  );
};

export default SimpleShow;
