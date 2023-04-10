import { CSSProperties, PropsWithChildren, useState } from 'react';
import { Popover, Tooltip } from 'antd';
import XiuIcon from '@/components/XiuIcon';
import { RightOutlined } from '@ant-design/icons';
import QRCode from 'qrcode.react';
import Feedback from './Feedback';
import './index.less';

interface HelpProps {
  style?: CSSProperties;
}

const Help = ({ style }: PropsWithChildren<HelpProps>) => {
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const content1 = (
    <div className="wechatQcode">
      <div className="qcode">
        <QRCode
          value="https://work.weixin.qq.com/kfid/kfcf7c815de3b3edd21"
          size={90}
        />
      </div>
      <div>咨询客服</div>
    </div>
  );
  return (
    <>
      <Feedback
        visible={feedbackVisible}
        onCancel={() => setFeedbackVisible(false)}
        style={style}
      />
      <Popover
        trigger="hover"
        getPopupContainer={ele => ele}
        placement="left"
        content={
          content1
          // <div className="help-options">
          //   <div
          //     onClick={() => {
          //       window.open(
          //         'http://wpa.qq.com/msgrd?v=3&uin=1791869299&site=qq&menu=yes',
          //       );
          //     }}
          //   >
          //     咨询客服 <RightOutlined />
          //   </div>
          //   <div onClick={() => setFeedbackVisible(true)}>
          //     问题反馈 <RightOutlined />
          //   </div>
          // </div>
        }
      >
        <div className="help-wrap" style={style}>
          <XiuIcon type="iconhelp" />
        </div>
      </Popover>
    </>
  );
};
export default Help;
