import { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { getCurrentAsset } from '@hc/editor-core';
import { QrcodeInfo, updateQrCode } from '@/kernel';

import { useQrCodeEditModal } from '@/store/adapter/useGlobalStatus';
import { clearQrCode } from '@/store/adapter/qrCodeStatus';
import { handleAddAsset } from '@/utils/assetHandler';

import QrCodeCanvas from '@/components/QrCodeCanvas';
import styles from './index.less';

const Preview = ({ state }: { state: QrcodeInfo }) => {
  const [, _visible] = useQrCodeEditModal();
  const [tooltipVisible, _tooltipVisible] = useState(false);

  return (
    <div className={styles.Preview}>
      <QrCodeCanvas className={styles.canvas} options={state} />
      <div className={styles.tooltip}>建议在真实场景中扫描确认</div>
      <Tooltip
        title="请输入二维码内容"
        onVisibleChange={vis => {
          if (vis && !state.text) {
            _tooltipVisible(true);
          } else {
            _tooltipVisible(false);
          }
        }}
        visible={tooltipVisible}
      >
        <Button
          onClick={() => {
            if (getCurrentAsset()) {
              updateQrCode({ ...state });
            } else {
              handleAddAsset({
                attribute: {
                  qrcodeInfo: { ...state },
                  width: 300,
                  height: 300,
                },
                meta: {
                  type: 'qrcode',
                },
              });
            }
            _visible(false);
            clearQrCode();
          }}
          style={{ width: '100%' }}
          disabled={!state.text}
          type="primary"
          size="large"
          className={styles.button}
        >
          保存并使用
        </Button>
      </Tooltip>
    </div>
  );
};

export default Preview;
