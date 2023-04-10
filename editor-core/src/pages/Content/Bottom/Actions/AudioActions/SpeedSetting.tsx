import { useState, useEffect } from 'react';
import {
  setTemplateSpeed,
  useGetAllTemplateByObserver,
  getTemplateTimeScale,
  getCurrentTemplateIndex,
  TemplateData,
  observer,
  setCurrentTime,
  useCurrentTemplate,
} from '@hc/editor-core';

import { Slider, message } from 'antd';
import { TEMPLATE_MIN_DURATION } from '@/config/basicVariable';

import { checkTotalTime } from '@/hooks/useCheckVideoTotalTime';
import { clickActionWeblog } from '@/utils/webLog';
import {
  useSetActiveAudio,
  updateAudioSpeed,
} from '@/store/adapter/useAudioStatus';
import { useSetMusic } from '@/hooks/useSetMusic';

export default observer(() => {
  const { template } = useCurrentTemplate();
  const { bindSetSpeed } = useSetMusic();

  const { allAnimationTime = 0, allAnimationTimeBySpeed } =
    template?.videoInfo || {};
  const { activeAudio, updateActiveAudio, setActiveAudioInCliping, inCliping } =
    useSetActiveAudio();

  const { speed = 1 } = activeAudio || {};

  const [inputSpeed, setInputSpeed] = useState(speed);

  useEffect(() => {
    setInputSpeed(speed);
  }, [speed]);

  function checkSpeed(value: number) {
    const newPageTime = allAnimationTime * (1 / value);
    clickActionWeblog('audioSpeed2');

    if (newPageTime < TEMPLATE_MIN_DURATION) {
      setInputSpeed(speed);
      message.info(
        `抱歉，因为设置倍速后视频时长小于${
          TEMPLATE_MIN_DURATION / 1000
        }秒，无法使用倍速功能`,
      );
      return;
    }

    updateAudioSpeed(value);
    activeAudio && bindSetSpeed(value, activeAudio.rt_id);
  }

  return (
    <div className="speed-tool">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>倍速</span>
        <span className="inputSpeed">{inputSpeed} x</span>
      </div>
      <Slider
        tooltipVisible={false}
        step={0.1}
        min={0.5}
        max={2.5}
        value={inputSpeed}
        onChange={setInputSpeed}
        onAfterChange={checkSpeed}
        marks={{ 0.5: '0.5x', 1: '', 1.5: '', 2: '', 2.5: '2.5x' }}
      />
    </div>
  );
});
