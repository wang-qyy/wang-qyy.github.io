import { QrcodeInfo } from '@/kernel';

const reducer = (state: QrcodeInfo, action: Partial<QrcodeInfo>) => {
  return { ...state, ...action };
};

export default reducer;
