import { useReducer } from 'react';

import { useGetCurrentAsset } from '@/kernel';
import { useQrCodeInfo } from '@/store/adapter/qrCodeStatus';

import Setting from '../Setting';
import Preview from '../Preview';
import styles from '../index.less';
import reducer from '../reducer';

const Wrapper = () => {
  const currentAsset = useGetCurrentAsset();
  const [value] = useQrCodeInfo();

  const qrcodeInfo = currentAsset?.attribute.qrcodeInfo || value;

  const [state, dispatch] = useReducer(reducer, { ...qrcodeInfo });

  // if (!currentAsset) return null;

  return (
    <div className={styles.Wrapper}>
      <Setting state={state} dispatch={dispatch} />
      <Preview state={state} />
    </div>
  );
};

export default Wrapper;
