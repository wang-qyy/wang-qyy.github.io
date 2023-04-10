import React from 'react';
import './index.less';
import { ossPath } from '@/config/urls';

export default function PubModalQQPanel() {
  return (
    <div className="pub-modal-qqPanel">
      <img
        className="pmq-qqGroup-qrcode"
        src={ossPath('/image/qrcode/wechat-group.png')}
        alt="微信群"
      />
      <div className="pmq-qqGrout-content">
        <p>微信扫码加入秀多多用户交（tu）流（cao）群</p>
        <p>有问题群里找小秀！</p>
      </div>
    </div>
  );
}
