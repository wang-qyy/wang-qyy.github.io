import React from 'react';
import BrandListItem from './Item';
import styles from './index.less';

function BrandList(props: {
  branfList: any[];
  setVisible: (str: string) => void;
}) {
  const { branfList, setVisible } = props;

  return (
    <div className={styles.brandList}>
      <div className={styles.brandListTitle}>选择品牌工具箱</div>
      <div className={styles.brandListContent}>
        {branfList.map(item => {
          return (
            <BrandListItem key={item.id} item={item} setVisible={setVisible} />
          );
        })}
      </div>
    </div>
  );
}

export default BrandList;
