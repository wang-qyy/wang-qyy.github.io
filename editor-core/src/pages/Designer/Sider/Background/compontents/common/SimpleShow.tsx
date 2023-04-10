import Mold from '@/pages/Designer/Sider/components/Mold';
import Item from '../Item';
import styles from '../index.less';

const SimpleShow = (Props: {
  title: string;
  bindClickMore: () => void;
  data: any[];
  type: 'pic' | 'video' | 'background';
}) => {
  const { title, bindClickMore, data, type } = Props;
  const itemArr = data;

  return (
    <Mold
      title={title}
      extraContent={
        <div className={styles.more} onClick={bindClickMore}>
          {'查看更多>'}
        </div>
      }
      contentStyle={{
        gridTemplateColumns: `repeat(auto-fill,minmax(130px,1fr))`,
      }}
    >
      {itemArr.map((item: any) => {
        return <Item key={item.id} item={item} type={type} />;
      })}
    </Mold>
  );
};

export default SimpleShow;
