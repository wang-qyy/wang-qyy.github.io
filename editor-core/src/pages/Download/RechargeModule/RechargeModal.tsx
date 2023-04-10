import React, { memo, useEffect, useState } from 'react';
import { Spin, Tooltip } from 'antd';
import classNames from 'classnames';
import { QuestionCircleFilled } from '@ant-design/icons';
import NoTitleModal from '@/components/NoTitleModal';
import { useRechargeModal } from '@/store/adapter/useGlobalStatus';
import { useCouponStatus } from '@/store/adapter/useCouponStatus';
import { useUserInfo } from '@/store/adapter/useUserInfo';
import { rechargeAcquisition } from '@/utils/webLog';
import { ossEditorPath } from '@/config/urls';
import PayQRCode from './PayQRCode';
import { LoadingIcon, useUserPay } from './atoms';
import LimitedTimeBenefits from './LimitedTimeBenefits';
import VipSide from './VipSide';
import VipPackages from './VipPackages';
import styles from './index.module.less';
import Coupon from './Coupon';
import { XiuIcon } from '@/components';

function RechargeMain() {
  const userInfo = useUserInfo();
  const { username, avatar, id } = userInfo;
  const [time, _time] = useState(0);

  const { couponStatus, updateCouponStatus } = useCouponStatus();
  const { tagKey, limitType, upgradeMode } = couponStatus;

  // 1是个人下载 2是个人商用
  const tagType = tagKey && tagKey.slice(0, 1);

  const {
    active,
    paySkus,
    showQrcode,
    amount,
    isLate,
    interests,
    qrcodeCls,
    selectPackage,
    refreshQrcode,
    updatePaySkus,
    payloadCode,
    fetchPaySkusLoading,
    fetchCreatePayLoading,
    needBeUpgradePkgInfo,
  } = useUserPay();

  const getTooltipWidth = (key: string) => {
    switch (key) {
      case '1':
        return '250px';
      case '2':
        return '294px';
      case '3':
        return '275px';
      default:
        return '100%';
    }
  };

  const packageChange = (activeKey: number | string) => {
    const coupons: any = paySkus && paySkus[activeKey]?.coupons;
    if (coupons?.length > 0) {
      const cid = coupons[0]?.cid;
      selectPackage(activeKey, { cid });
    } else {
      selectPackage(activeKey);
    }
  };

  useEffect(() => {
    if (paySkus) {
      if (paySkus?.length > 0) {
        packageChange(active);
      }
    }
  }, [paySkus]);

  // 获取展示vip标签数组 3 是企业会员
  const getVipTagArr = (type: string) => {
    switch (type) {
      case '3':
        return [
          {
            name: '企业商用版',
            key: '3',
            tagKey: '30',
            tooltipTitle: '以企业身份（工商登记注册的经营主体）从事',
            tooltipContent: '的商业盈利行为，盈利主体为企业。',
          },
        ];

      default: {
        const items = [
          {
            name: '个人下载版',
            key: '1',
            tagKey: '10',
            tooltipTitle: '不可以商用',
            tooltipContent: '仅供个人学习分享使用，不以盈利为目的',
          },
          {
            name: '个人商用版',
            key: '2',
            tagKey: '20',
            tooltipTitle: '以自然人身份(持自然人有效身份证)从事的商业盈',
            tooltipContent: '利行为盈利主体为个人',
          },
        ];

        if (upgradeMode) {
          return [items[+tagType - 1]];
        } else {
          return items;
        }
      }
    }
  };

  useEffect(() => {
    updatePaySkus();
  }, [tagKey]);

  useEffect(() => {
    rechargeAcquisition({ limitType: upgradeMode ? 'upgrade' : limitType });
  }, []);

  // 获取一小时后的日期  时间
  const expire_time = () => {
    const date = new Date();
    const date1 = new Date().getTime(); // 获取当前时间戳

    // 当前时间戳+3600s（一小时，其他时间通过计算时间戳进行相应加减），重新设置 Date 对象
    return date.setTime(date1 + 3600000) / 1000;
  };

  // 获取倒计时初始时间
  useEffect(() => {
    _time(expire_time());
  }, []);

  return (
    <div className={styles['recharge-modal']}>
      {interests && (
        <div className={styles['recharge-modal-inner']}>
          <div className={styles['recharge-modal-Top']}>
            <div className={styles['user-avatar']}>
              <img src={avatar} alt="头像" className={styles.portrait} />
            </div>
            <div className={styles['vip-user-info']}>
              <p className={styles['vip-username']}>充值账号：{username}</p>
              <p className={styles['vip-id']}>ID：{id}</p>
            </div>
            <div className={styles['vip-tab']}>
              {getVipTagArr(tagType).map(item => {
                return (
                  <div
                    key={item.key}
                    className={classNames(styles['vip-tab1'], {
                      [styles.vipTabActive]: tagType === item.key,
                    })}
                    // style={{
                    //   background: `url(${ossEditorPath(
                    //     `/image/VIP/${tagType === item.key ? 'tixingActive3' : 'tixing3'
                    //     }.png?v3`,
                    //   )})`,
                    // }}
                    style={{
                      background: `url(${ossEditorPath(
                        `/image/VIP/${tagType === item.key ? 'tixingActive2' : 'tixing2png'
                        }.png?v3`,
                      )})`,
                    }}
                    onClick={() => {
                      updateCouponStatus({
                        tagKey: item.tagKey,
                      });
                    }}
                  >
                    {item.name}
                    <Tooltip
                      placement="bottom"
                      overlayInnerStyle={{
                        width: getTooltipWidth(item.key),
                        fontSize: '12px',
                        padding: '8px 16px ',
                      }}
                      title={() => {
                        return (
                          <div>
                            <div>{item.tooltipTitle}</div>
                            <div>{item.tooltipContent}</div>
                          </div>
                        );
                      }}
                    >
                      <QuestionCircleFilled className={styles.vipTabItemIcon} />
                    </Tooltip>
                  </div>
                );
              })}
            </div>
            <h6 className={styles['expire-date']}>
              购买后折合到期时间：
              <span className={styles['primary-color']}>
                {interests.expire === '-1' ? '终身' : interests.expire}
              </span>
            </h6>
          </div>
          <div className={styles['recharge-modal-Bottom']}>
            <VipSide active={active} tagType={tagType} interests={interests} />
            <Spin indicator={LoadingIcon} spinning={fetchPaySkusLoading}>
              <div className={styles['vip-shop']}>
                <div className={styles['vip-detail']}>
                  <h6 hidden={tagType === '3'}>请选择合适的套餐</h6>
                  <div className={styles['vip-packages-wrapper']}>
                    <ul className={styles['vip-packages']}>
                      {paySkus &&
                        paySkus.map((item: any, index: number) => (
                          <VipPackages
                            active={index == active}
                            packages={item}
                            index={index}
                            tagType={tagType}
                            key={item.code}
                            packageChange={packageChange}
                          />
                        ))}
                    </ul>
                  </div>
                </div>
                {/* <LimitedTimeBenefits activePaySkus={paySkus[active]} /> */}
                {/* 优惠券显示 */}
                {paySkus && paySkus[active]?.coupons?.length > 0 && (
                  <Coupon
                    data={paySkus[active]?.coupons}
                    callback={cid => {
                      selectPackage(active, { cid });
                    }}
                    time={time}
                  />
                )}
                <PayQRCode
                  loading={fetchCreatePayLoading}
                  showQrcode={showQrcode}
                  isLate={isLate}
                  payloadCode={payloadCode}
                  price={amount || interests?.price}
                  refreshQrcode={refreshQrcode}
                  className={qrcodeCls}
                  priceDesc={upgradeMode && paySkus && (
                    <p className={styles.upgradePriceDesc}>
                      升级套餐价格：<i>{paySkus[active].price?.toFixed(2)}元</i> - 原套餐剩余金额：<i>{(+needBeUpgradePkgInfo.pay_price - needBeUpgradePkgInfo.pay_price / needBeUpgradePkgInfo.total_day * (needBeUpgradePkgInfo.total_day - needBeUpgradePkgInfo.surplus_day)).toFixed(2)}元</i>
                      <span className={styles.icon}>
                        <XiuIcon type='iconwenhao' />
                        <span>
                          <p>原套餐剩余金额计算：</p>
                          <p>{needBeUpgradePkgInfo.pay_price}元 -（{needBeUpgradePkgInfo.pay_price}元/{needBeUpgradePkgInfo.total_day}天）* 会员使用{needBeUpgradePkgInfo.total_day - needBeUpgradePkgInfo.surplus_day}天</p>
                        </span>
                      </span>
                    </p>
                  )}
                />
                <div
                  className={styles['recharge-modal-footer']}
                  hidden={tagType !== '3'}
                >
                  温馨提示：成功支付后，联系客服享受极速开通发票服务
                </div>
              </div>
            </Spin>
          </div>
        </div>
      )}
    </div>
  );
}

function RechargeModal() {
  const rechargeModal = useRechargeModal();
  const { updateCouponStatus } = useCouponStatus();

  return (
    <>
      <NoTitleModal
        visible={Boolean(rechargeModal.value)}
        onCancel={() => {
          rechargeModal.close();
          updateCouponStatus({
            tagKey: '10',
            upgradeMode: false,
            upgradePkgId: undefined,
          });
        }}
        footer={false}
        centered
        wrapClassName="rechargeModal"
        width={960}
      >
        <RechargeMain />
      </NoTitleModal>
    </>
  );
}

export default memo(RechargeModal);
