import React, { memo, useState, useEffect } from 'react';
import classnames from 'classnames';
import { useCountDown } from '@/hooks/useCountDown';
import styles from './index.less';

const VipPackages = (props: {
  packageChange: Function;
  index: number;
  packages: any;
  active: boolean;
  tagType: string;
}) => {
  const [T, setT] = useState(0);
  const { packageChange, index, packages, active, tagType } = props;
  const { describe, price, expire } = packages || {};

  // item.coupons[0].expire_time
  const onPackageChange = () => {
    packageChange(index);
  };

  useEffect(() => {
    if (packages.is_countdown) {
      const nowtime = new Date(); // 获取当前时间
      const time =
        packages.is_countdown &&
        packages.coupons &&
        packages.coupons[0] &&
        packages.coupons[0].expire_time;
      const lefttime = time || nowtime.getTime() / 1000 + 3600; // 距离结束时间的毫秒数
      setT(lefttime);
    }
  }, [packages]);

  const count = useCountDown(T);

  return (
    <li
      onClick={onPackageChange}
      className={classnames({
        [styles.active]: active,
        [styles.vipPackagesLi]: true,
      })}
    >
      <div className={styles.price}>
        <span>￥</span>
        <span>{price}</span>
        <span>/{expire === '-1' ? '终身' : '年'}</span>
      </div>
      <div className={styles.o_price}>{describe}</div>
      <p
        className={styles.count}
        dangerouslySetInnerHTML={{ __html: packages.label_html }}
      />
      <div className={styles.explain}>编辑器导出+素材下载</div>

      {/* {packages.is_countdown && (
        <div className={styles.timeLimit}>{`限时${count}`}</div>
      )} */}
      {['40009', '40008'].includes(packages?.code) && (
        <div className={styles.postscript}>双十一抢购</div>
      )}
    </li>
  );
};

export default memo(VipPackages);
