import { useCreation } from 'ahooks';
import { useState, useReducer } from 'react';

import { createAssetClass, assetBlur } from '@hc/editor-core';

import { QrcodeInfo } from '@/kernel';
import { handleAddAsset } from '@/utils/assetHandler';
import QrCode from '@/kernel/utils/QrCode';
import { newQrCode } from '@/utils/assetHandler/assetTemplate';

import { useQrCodeEditModal } from '@/store/adapter/useGlobalStatus';
import { useQrCodeInfo } from '@/store/adapter/qrCodeStatus';
import { clickActionWeblog } from '@/utils/webLog';

import styles from './index.less';
import { qrCodeList } from './options';

const Item = ({ opt }: { opt: QrcodeInfo }) => {
  const [canvas, _canvas] = useState<HTMLCanvasElement | null>();
  const [visible, _visible] = useQrCodeEditModal();

  const [value, update] = useQrCodeInfo();

  useCreation(() => {
    if (!canvas) return;
    const { rt_url: image } = opt;
    const instance = new QrCode({ ...opt, image, canvas });
    instance.create();
    return instance;
  }, [...Object.values(opt), canvas]);

  const addAsset = async () => {
    clickActionWeblog('action_qrCode_add');
    assetBlur();
    // await handleAddAsset({
    //   attribute: {
    //     width: 300,
    //     height: 300,
    //     qrcodeInfo: { ...opt },
    //   },
    //   meta: {
    //     type: 'qrcode',
    //   },
    // });

    const base = newQrCode();

    Object.assign(base.attribute, {
      width: 300,
      height: 300,
      qrcodeInfo: { ...opt },
    });

    const asset = createAssetClass(base);

    update({ ...asset.getAssetCloned().attribute.qrcodeInfo });
    _visible(true);
  };

  return (
    <div className={styles.item} onClick={addAsset}>
      <canvas className={styles.canvas} ref={r => _canvas(r)} />
    </div>
  );
};

const QrCodePanel = () => {
  return (
    <div className={styles.QrCodePanel}>
      <div className={styles.list}>
        {qrCodeList.map((item, i) => (
          <Item key={i} opt={item} />
        ))}
      </div>
    </div>
  );
};

export default QrCodePanel;
