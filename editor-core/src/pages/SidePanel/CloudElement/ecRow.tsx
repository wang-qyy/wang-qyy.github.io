import ElementItem from '@/pages/SidePanel/Replace/Item';

import styles from './index.less';

const ElementCatalogRow = (props: {
  item: any;
  getMore: () => void;
  onAfterAdd: (params: any) => void;
}) => {
  const { item, getMore, onAfterAdd } = props;
  return (
    <div className={styles.content}>
      <div className={styles.contentTop}>
        <div className={styles.left}>{item?.class_name}</div>
        <div className={styles.right} onClick={getMore}>
          {'更多>'}
        </div>
      </div>
      <div className={styles.contentBottom}>
        {item?.assetList?.map((i: any) => {
          return (
            <ElementItem
              key={i.id}
              data={i}
              onSuccess={() => onAfterAdd(i)}
              type="element"
            />
          );
        })}
      </div>
    </div>
  );
};
export default ElementCatalogRow;
