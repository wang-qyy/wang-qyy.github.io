import React, { useMemo, useState } from 'react';
import classnames from 'classnames';
import { LoadingOutlined } from '@ant-design/icons';
import { useRequest, usePersistFn } from 'ahooks';
import { useCouponStatus } from '@/store/adapter/useCouponStatus';
import { assetHandler } from '@kernel/store';
import { getCurrentTemplate, toJS } from '@hc/editor-core';
import {
  usePaySuccessModal,
  useRechargeModal,
} from '@/store/adapter/useGlobalStatus';
// import { useGetDownload } from '@/hooks/useDownload';

import { checkOrder, createPay, getPaySkus, getUpgSkus } from '@/api/pub';

export const LoadingIcon = (
  <LoadingOutlined type="loading" style={{ fontSize: 24 }} spin />
);
// const { getCurrentTemplate } = assetHandler;

export function useUserPay() {
  const { couponStatus, updateCouponStatus } = useCouponStatus();
  const { tagKey, upgradeMode, upgradePkgId } = couponStatus;

  const tagType = tagKey.slice(0, 1);
  // 默认显示套餐
  const cardType = (tagKey && tagKey.slice(1, 2)) || '0';

  const [isLate, setIsLate] = useState(false);
  const [startDate, setStartDate] = useState(0);
  const [state, setState] = useState({
    paySkus: null,
    active: cardType,
    payloadCode: '',
    amount: '', // 支付金额
    prams: null, // 存储createPay参数 用于支付二维码过期重新请求用
    needBeUpgradePkgInfo: {} as Record<string, any>,
  });
  const { paySkus, active, payloadCode, amount, prams } = state;

  // 获取PaySkus
  const bindPaySkus = (type: string, data: any) => {
    switch (type) {
      case '1':
        return data.personalSkus;
      case '2':
        return data.skus;
      case '3':
        return data.enterpriseSkus;
    }
  };
  const fetchPaySkus = useRequest(upgradeMode ? getUpgSkus : getPaySkus, {
    manual: true,
    cacheKey: upgradeMode ? undefined : 'pay-skus',
    onSuccess: data => {
      const paySkusList = bindPaySkus(tagType, data);
      setState(prev => ({ ...prev, active: cardType, paySkus: paySkusList, needBeUpgradePkgInfo: (data as any).current_vip_info || {} }));
    },
  });

  const rechargeModal = useRechargeModal();
  const paySuccessModal = usePaySuccessModal();

  const paySuccess = () => {
    paySuccessModal.open();
    // 刷新下载次数
    rechargeModal.close();
    // updateDownloadInfo();
  };

  // 检查订单支付情况
  const startCheckOrder = useRequest(checkOrder, {
    manual: true,
    pollingInterval: 1000,
    onSuccess: data => {
      const newDate = new Date().getTime();

      if (data.is_pay === 1) {
        paySuccess();
        startCheckOrder.cancel();
      }
      if (newDate - startDate > 10 * 60 * 1000) {
        startCheckOrder.cancel();
        setStartDate(0);
        setIsLate(true);
      }
    },
  });

  const fetchCreatePay = useRequest(createPay, {
    manual: true,
    onSuccess: data => {
      const { payload_code, order } = data;
      setState(prev => ({
        ...prev,
        amount: order?.amount,
        payloadCode: payload_code,
      }));
      // 轮询订单支付情况
      const date = new Date().getTime();
      setIsLate(false);
      setStartDate(date);
      startCheckOrder.run(order.order_no);
    },
  });

  // srm埋点 获取首次打开充值弹窗的点击按钮
  const srm = useMemo(() => {
    const xa = window?.xa || {};
    let source_srm = '';
    let focus_srm;
    if (xa?.srm) {
      source_srm = xa.srm?.get?.();
      focus_srm = xa.srm?.getActiveSrm?.();

      const tid = String(getCurrentTemplate().template.templateId)?.split(
        '.',
      )[0];
      focus_srm = focus_srm.split('.');

      focus_srm[3] = `t${tid}`;

      focus_srm = focus_srm.join('.');
    }
    return {
      source_srm,
      focus_srm,
    };
  }, []);

  const updatePaySkus = usePersistFn(() => {
    if (upgradeMode) fetchPaySkus.run(upgradePkgId);
    else fetchPaySkus.run();
  });

  // 切换价格档位
  function selectPackage(activeKey: number | string, prams?: any) {
    setState((prev: any) => ({
      ...prev,
      active: activeKey,
      prams,
    }));
    if (paySkus && paySkus[activeKey]) {
      const upgradeInfo = { rch_type: upgradeMode ? 'upg' : undefined, pkg_id: upgradePkgId };
      if (prams) {
        fetchCreatePay.run(paySkus[activeKey]?.code, srm, { ...prams, ...upgradeInfo });
      } else {
        fetchCreatePay.run(paySkus[activeKey]?.code, srm, upgradeInfo);
      }
    }
  }

  // 刷新二维码
  const refreshQrcode = () => {
    if (prams) {
      selectPackage(active, prams);
    } else {
      selectPackage(active);
    }
  };
  const interests = paySkus ? paySkus[active] : null; // 侧边显示信息
  const showQrcode = payloadCode !== ''; // 是否显示二维码
  const qrcodeCls = classnames({
    'qrcode-show': true,
    'show-qrcode-loading': !showQrcode,
  });

  return {
    active,
    paySkus,
    payloadCode,
    amount,
    interests,
    qrcodeCls,
    showQrcode,
    isLate,
    selectPackage,
    refreshQrcode,
    updatePaySkus,
    fetchPaySkusLoading: fetchPaySkus.loading,
    fetchCreatePayLoading: fetchCreatePay.loading,
    startCheckOrder,
    needBeUpgradePkgInfo: state.needBeUpgradePkgInfo,
  };
}
