import { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import { useGetDownload } from '@/hooks/useDownload';
import { usePaySuccessModal } from '@/store/adapter/useGlobalStatus';
import { checkOrder, createPay } from '@/api/pub';

export function useCreatePay(props: any) {
  const { visible, handleClose, code, inc } = props;
  const [payloadCode, setPayloadCode] = useState('');
  const { open: updateDownloadInfo } = useGetDownload('refresh');
  const paySuccessModal = usePaySuccessModal();

  // 检查订单支付情况
  const startCheckOrder = useRequest(checkOrder, {
    manual: true,
    pollingInterval: 1000,
    onSuccess: data => {
      if (data.is_pay === 1) {
        startCheckOrder.cancel();
        handleClose();
        // 刷新下载次数
        paySuccessModal.open();
        updateDownloadInfo();
      }
    },
  });

  // 获取二维码
  const fetchCreatePay = useRequest(createPay, {
    manual: true,
    onSuccess: data => {
      const { payload_code, order } = data;
      // 轮询订单支付情况
      setPayloadCode(payload_code);
      startCheckOrder.run(order.order_no);
    },
  });

  useEffect(() => {
    if (visible) {
      fetchCreatePay.run(code, { inc });
    }
  }, [visible]);

  return { payloadCode, startCheckOrder };
}
