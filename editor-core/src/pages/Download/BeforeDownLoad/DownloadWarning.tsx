import { Button } from 'antd';
import PubModalWarning from '@/components/PubModalWarning';
import { ExclamationCircleFilled } from '@ant-design/icons';
import {
  useDownloadInfo,
  useDownloadPopover,
} from '@/store/adapter/useGlobalStatus';
import { useDownload } from '@/hooks/useDownload';

const WarningIcon = <ExclamationCircleFilled style={{ color: '#FDB202' }} />;

function ClickPopover() {
  const Download = useDownload();
  const DownloadInfo = useDownloadInfo();
  const {
    message,
    description,
    buttonText,
    buttonType,
    remainingTimes,
    pixelType,
  } = DownloadInfo.downloadInfo;

  const { open } = useDownloadPopover();

  const title = (
    <span>
      {message}
      {remainingTimes > 0 && (
        <>
          <span style={{ color: '#5A4CDB' }}>{remainingTimes}</span>次
        </>
      )}
    </span>
  );

  const onClick = () => {
    const { download, openVipRecharge, openVipUpgrade, openMyDownload } =
      DownloadInfo.buttonType;

    switch (buttonType) {
      case download:
        // Download.startDownLoad(pixelType);
        open();
        DownloadInfo.close();
        break;
      case openVipRecharge:
        Download.openRechargeModal();
        DownloadInfo.close();
        break;
      case openVipUpgrade:
        window.open('//xiudodo.com/pricing.html');
        DownloadInfo.close();
        break;
      case openMyDownload:
        window.open('//xiudodo.com/my/download');
        DownloadInfo.close();
        break;
    }
  };
  return (
    <PubModalWarning
      visible={DownloadInfo.visible}
      onCancel={DownloadInfo.close}
      icon={WarningIcon}
      title={title}
      description={description}
      button={
        <Button loading={Download.loading} type="primary" onClick={onClick}>
          {buttonText}
        </Button>
      }
    />
  );
}

export default ClickPopover;
