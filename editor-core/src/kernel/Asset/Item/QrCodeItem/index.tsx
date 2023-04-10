import { observer } from 'mobx-react';

import { AssetItemProps } from '@/kernel/typing';
import { assetIdPrefix } from '@/kernel/utils/const';
import { useQrCodeEditModal } from '@/store/adapter/useGlobalStatus';

import QrCodeCanvas from '@/components/QrCodeCanvas';

const QrCodeItem = (props: AssetItemProps) => {
  const { asset } = props;
  const {
    attribute: { qrcodeInfo },
    id,
  } = asset;

  const [, setVisible] = useQrCodeEditModal();

  const onDoubleClick = () => {
    setVisible(true);
  };

  if (!qrcodeInfo) return null;

  return (
    <QrCodeCanvas
      options={qrcodeInfo}
      onDoubleClick={onDoubleClick}
      data-asset-id={`${assetIdPrefix}${id}`}
    />
  );
};

export default observer(QrCodeItem);
