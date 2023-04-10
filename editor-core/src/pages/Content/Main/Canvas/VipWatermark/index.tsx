import { PropsWithChildren } from 'react';
import classNames from 'classnames';
import XiuIcon from '@/components/XiuIcon';
import { useUserInfo } from '@/store/adapter/useUserInfo';
import { useRechargeModal } from '@/store/adapter/useGlobalStatus';
import { getTemplateInfo } from '@/store/adapter/useTemplateInfo';

import { useCheckLoginStatus } from '@/hooks/loginChecker';

import { dataAcquisition, ActionType } from '@/utils/webLog';

import styles from './index.modules.less';

interface WatermarkProps {
  showDesc?: boolean;
}

export default function Watermark({
  showDesc = true,
}: PropsWithChildren<WatermarkProps>) {
  const userInfo = useUserInfo();
  const { ratioType } = getTemplateInfo();
  const { open } = useRechargeModal();
  const { checkLoginStatus } = useCheckLoginStatus();

  const handleClick = () => {
    if (!checkLoginStatus()) {
      dataAcquisition(ActionType.canv_cli_wm);
      open();
    }
  };

  if (userInfo.vip_type !== 0 || userInfo?.team_id !== 0) return <></>;

  return (
    <>
      {/* <div className={styles.wrap}>
        <XiuIcon
          type="icona-huaban1fuben"
          className={styles['watermark-icon']}
        />
        <span className={styles.text}>视频制作神器</span>
      </div> */}

      {showDesc && (
        <div
          className={classNames(styles.desc, styles['desc-right'], {
            // [styles['desc-right']]: ratioType !== 'w',
            // [styles['desc-top']]: ratioType === 'w',
          })}
          onClick={handleClick}
        >
          移除水印
          <br />
          畅享高清视频
        </div>
      )}
    </>
  );
}
