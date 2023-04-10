import React, { useEffect, useState } from 'react';
import { CheckCircleFilled } from '@ant-design/icons';
import styles from './index.less';

function LimitedTimeBenefits(props: any) {
  const { activePaySkus } = props;
  const [amount, setAmount] = useState<any>({});

  useEffect(() => {
    if (activePaySkus?.gift_pkg) {
      setAmount(activePaySkus?.gift_pkg);
    }
  }, [activePaySkus]);

  return (
    <div className={styles.limitedTimeBenefits}>
      <div className={styles.limitedTimeBenefitsTop}>
        <div className={styles.limitedTimeBenefitsRight}>
          <div className={styles.topLeft}>
            购买全站下载会员立即赠送以下小工具使用权
          </div>
          <div className={styles.topRight}>
            (注:赠送小工具使用权限均在会员有效期内有效)
          </div>
        </div>
      </div>

      <div className={styles.limitedTimeBenefitsBottom}>
        {[
          {
            name: 'AI语音小工具 ',
            count: amount?.ai?.value,
            company: ' 次',
            price: amount?.ai?.price,
          },
          {
            name: '抠图工具套餐 ',
            count: amount?.kt?.value,
            company: ' 张',
            price: amount?.kt?.price,
          },
          {
            name: '视频压缩工具 ',
            count: amount?.cp?.value,
            company: amount?.cp?.value === -1 ? '' : ' 次',
            price: amount?.cp?.price,
          },
          {
            name: '视频水印工具 ',
            count: amount?.vm?.value,
            company: amount?.vm?.value === -1 ? '' : ' 次',
            price: amount?.vm?.price,
          },
        ].map(item => {
          return (
            item.count !== 0 && (
              <div key={item.name} className={styles.bottomItem}>
                <CheckCircleFilled className={styles.bottomItemIcon} />
                <span className={styles.bottomItemTxt}>
                  {item.name}
                  <span>{item.count === -1 ? '无限使用' : item.count}</span>
                  {item.company}
                </span>
                <span className={styles.bottomItemTxt1}>
                  ¥0 <span>原价¥{item.price}</span>
                </span>
              </div>
            )
          );
        })}
      </div>
    </div>
  );
}

export default LimitedTimeBenefits;
