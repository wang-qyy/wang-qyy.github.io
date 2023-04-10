import styles from './index.less';

import Mold from '../../components/Mold';
import Item from '../compontents/List/Item';

const InitialPage = (Props: {
  bindClickMore: (title: string, type: string) => void;
  minVideoArr: Array<object> | null;
}) => {
  const { bindClickMore, minVideoArr } = Props;

  return (
    <div className={styles.initialPageWarp}>
      {minVideoArr &&
        minVideoArr.map((item: any) => {
          return (
            <Mold
              title={item?.title}
              key={item?.type}
              extraContent={
                <div
                  className={styles.simpleShowTopRight}
                  onClick={() => bindClickMore(item?.title, item?.type)}
                >
                  {'查看更多>'}
                </div>
              }
            >
              {item.items.map(ele => (
                <Item item={ele} key={ele.id} />
              ))}
            </Mold>
          );
        })}
    </div>
  );
};

export default InitialPage;
