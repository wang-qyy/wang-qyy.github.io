import React, { useState } from 'react';
import { Tooltip, message } from 'antd';
import XiuIcon from '@/components/XiuIcon';
import classnames from 'classnames';
import { applyExport } from '@/api/pub';
import { useRequest } from 'ahooks';
import {
  useRechargeModal,
  useUserBindPhoneModal,
} from '@/store/adapter/useGlobalStatus';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import { useUserInfo } from '@/store/adapter/useUserInfo';
import PhoneBinding from '@/pages/GlobalMobal/PhoneBinding';
import { handleSave } from '@/utils/userSave';
import { dataActiontype } from '@/utils/webLog';

import ShareModal from './ShareModal';
import '../index.less';
import { useCheckShare } from './hook';

function ShareVideo() {
  const { toApprovel } = useCheckShare();
  const [id, setId] = useState('');
  const rechargeModal = useRechargeModal();
  const { checkLoginStatus } = useCheckLoginStatus();
  const { showBindPhoneModal } = useUserBindPhoneModal();
  // const [phoneBindingShow, setPhoneBindingShow] = useState(false);
  const userInfo = useUserInfo();

  const fetchApplyExport = useRequest(applyExport, {
    manual: true,
    onSuccess: res => {
      if (res?.code === 1005) {
        if (res.data.err === 'not_vip') {
          rechargeModal.open();
        }
      }
      if (res?.download_id) {
        setId(res.download_id);
      }
    },
  });

  const startSynthesis = () => {
    if (checkLoginStatus()) {
      return;
    }
    if (userInfo?.bind_phone !== 1) {
      showBindPhoneModal();
    } else {
      handleSave({
        onSuccess: res => {
          if (res.stat === 1) {
            fetchApplyExport.run({
              id: res.info?.id,
              pixel_type: '720',
              type: 'share',
            });
          }
        },
      });
    }
  };

  // 开启分享审批
  const toCheckShare = () => {
    toApprovel();
  };
  return (
    <Tooltip title="分享" getTooltipContainer={ele => ele}>
      <div
        id="userSave"
        className={classnames('xiudodo-header-preview', 'xiudodo-header-share')}
        onClick={() => {
          dataActiontype('ShareVideo', 'clickShare');
          toCheckShare();
        }}
      >
        <XiuIcon type="icondouyinzhuanfa" className="xiudodo-header-icon" />
        <span className="xiudodo-header-item-desc">分享</span>
        {/* <div className="xiudodo-header-item-vip">VIP</div> */}
      </div>
      <ShareModal id={id} setId={setId} startSynthesis={startSynthesis} />
      {/* <PhoneBinding
        phoneBindingShow={phoneBindingShow}
        setPhoneBindingShow={setPhoneBindingShow}
        loginCallback={() => {}}
      /> */}
    </Tooltip>
  );
}

export default ShareVideo;
