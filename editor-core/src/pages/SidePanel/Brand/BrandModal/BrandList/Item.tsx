import React from 'react';
import { useActiveBrand } from '@/store/adapter/useGlobalStatus';
import classNames from 'classnames';
import styles from './index.less';
import { useBrand } from '../hook/useBrand';

interface Item {
  id: string;
  title: string;
  coverInfo: any;
}
function BrandListItem(props: {
  item: Item;
  setVisible: (str: string) => void;
}) {
  const { item, setVisible } = props;
  const { updateBranfList, bindActiveBrand } = useBrand();
  const { activeBrand, updateActiveBrand } = useActiveBrand();

  return (
    <div
      className={classNames(styles.brandListItem, {
        [styles.brandListItemActive]: activeBrand?.id === item.id,
      })}
      onClick={() => {
        bindActiveBrand(res => {
          setVisible('');
          updateActiveBrand(res);
        }, item.id);
      }}
    >
      <div className={styles.itemTop}>
        <div className={styles.itemTopImg}>
          <img
            src={item.coverInfo.cover_path}
            style={
              item.coverInfo.width / item.coverInfo.height > 205 / 80
                ? { width: '100%' }
                : { height: '100%' }
            }
            alt=""
          />
        </div>
        {item.coverInfo.colors?.length > 0 && (
          <div className={styles.itemTopColor}>
            {item.coverInfo.colors.map(i => {
              return (
                <div
                  key={i}
                  style={{
                    background: i,
                  }}
                  className={styles.itemTopColorItem}
                />
              );
            })}
          </div>
        )}
      </div>
      <div className={styles.itemBottom}>
        <span className={styles.itemBottomLeft}>{item.title}</span>
      </div>
    </div>
  );
}

export default BrandListItem;
