import { getTemplateClassify } from '@/api/template';
import { useAppDispatch, useAppSelector, qrCodeAction, store } from '@/store';

import { QrCodeInfo } from '@/store/reducer/qrCode';

export const useQrCodeInfo = () => {
  const dispatch = useAppDispatch();
  const { data } = useAppSelector(store => ({
    data: store.qrCode,
  }));

  function update(params: Partial<QrCodeInfo>) {
    dispatch(qrCodeAction.setQrCodeInfo(params));
  }

  return [data, update];
};

export function clearQrCode() {
  store.dispatch(qrCodeAction.clear());
}
