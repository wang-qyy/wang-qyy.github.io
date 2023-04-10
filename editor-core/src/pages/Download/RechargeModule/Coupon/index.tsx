import React, { useState, useEffect } from 'react';
import { CheckCircleFilled } from '@ant-design/icons';
import { ossEditorPath } from '@/config/urls';
import styles from './index.less';
import Count from './count';

function Coupon(props: {
  data: any;
  time: number;
  callback: (cid: string) => void;
}) {
  const { data, callback, time } = props;
  const [checked, _checked]: number | any = useState();
  // 选择优惠券
  const bindCheck = (cid: number) => {
    if (cid === checked) {
      _checked('');
      callback('');
    } else {
      _checked(cid);
      callback(cid);
    }
  };

  // 默认选中第一张优惠券
  useEffect(() => {
    if (data?.length > 0) {
      const cid = data[0]?.cid;
      _checked(cid);
    } else {
      _checked('');
    }
  }, [data]);
  return (
    <>
      {data?.length > 0 && (
        <div className={styles.couponWarp}>
          {data?.map((item: any) => {
            return (
              <div key={item.id} className={styles.coupon}>
                {/* <div className={styles.couponTitle}> 优惠券</div> */}
                <div className={styles.couponContentWarp}>
                  <div className={styles.couponContent}>
                    <CheckCircleFilled
                      onClick={() => {
                        bindCheck(item.cid);
                      }}
                      className={styles.couponRadio}
                      style={
                        checked === item.cid
                          ? { color: '#8460ff' }
                          : { color: '#ffffff' }
                      }
                    />

                    <div
                      className={styles.couponCard}
                      style={{
                        background: `url(${ossEditorPath(
                          '/image/VIP/coupon2.png',
                        )})`,
                      }}
                    >
                      <div className={styles.cardLeft}>
                        <div className={styles.cardLeftLeft}>¥</div>
                        <div className={styles.cardLeftRight}>{item.cash}</div>
                      </div>
                      <div className={styles.cardRight}>
                        <div className={styles.cardRightTop}>{item.title}</div>
                        <div className={styles.cardRightBottom}>
                          倒计时：
                          <Count expire_time={time} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default Coupon;
