import React from 'react';
import { Button, Modal } from 'antd';
import {
  useRechargeModal,
  useUpgradeVipGuidance,
} from '@/store/adapter/useGlobalStatus';
import './index.less';

export default function VipWarning() {
  const { value, close } = useUpgradeVipGuidance();
  const RechargeModal = useRechargeModal();
  const onClick = () => {
    close();
    RechargeModal.open();
  };
  const button = (
    <Button type="primary" onClick={onClick}>
      成为VIP立即下载
    </Button>
  );

  return (
    <Modal
      visible={Boolean(value)}
      width={370}
      onCancel={close}
      className="upgradeVipGuidance"
      footer={false}
      getContainer={document.getElementById('xiudodo')}
    >
      <h6 className="upgradeVipGuidance-title">开通VIP 视频海量下</h6>
      <div className="upgradeVipGuidance-main">
        <p>
          <span className="upgradeVipGuidance-label">海量</span> <i>·</i>{' '}
          <em>2w+</em>视频内容实时更新
        </p>
        <p>
          <span className="upgradeVipGuidance-label">商用</span> <i>·</i>{' '}
          全站所有内容素材均<em>可商用</em>
        </p>
        <p>
          <span className="upgradeVipGuidance-label">高效</span> <i>·</i>{' '}
          操作便捷 <em>高速</em>下载
        </p>
        <p>
          <span className="upgradeVipGuidance-label">超值</span> <i>·</i> 限时
          <em>低价</em> 单个视频仅需1分钱
        </p>
        {button}
      </div>
    </Modal>
  );
}
