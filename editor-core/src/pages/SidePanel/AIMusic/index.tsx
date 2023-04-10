import { Button } from 'antd';
import { useState } from 'react';
import SidePanelWrap from '@/components/SidePanelWrap';

import { clickActionWeblog } from '@/utils/webLog';
import AIMusicList from './AIMusicList';
import AIModal from './AIModal';
import './index.less';
// AI文字转语音
const AIMusic = () => {
  const [visible, setVisible] = useState(false);
  const [reload, setReload] = useState(false);

  return (
    <SidePanelWrap
      search={
        <Button
          className="ai-upload-icon"
          type="primary"
          onClick={() => {
            // 点击文字转语音按钮
            clickActionWeblog('ai_audio_004');
            setVisible(true);
          }}
        >
          文字转语音
        </Button>
      }
    >
      <AIMusicList reload={reload} />
      {visible && (
        <AIModal
          onClose={() => {
            setVisible(false);
          }}
          onChange={() => {
            setReload(!reload);
          }}
        />
      )}
    </SidePanelWrap>
  );
};
export default AIMusic;
