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

import { Slider, Checkbox, message } from 'antd';
import { TEMPLATE_MIN_DURATION } from '@/config/basicVariable';

import { checkTotalTime } from '@/hooks/useCheckVideoTotalTime';
import { clickActionWeblog } from '@/utils/webLog';

import './index.less';

export default observer(() => {
  const { template } = useCurrentTemplate();
  const { templates } = useGetAllTemplateByObserver();

  const {
    allAnimationTime = 0,
    allAnimationTimeBySpeed,
    speed = 1,
  } = template?.videoInfo || {};

  const [inputSpeed, setInputSpeed] = useState(1);
  const [applyAll, setApplyAll] = useState(false);
  const [applyNum, setApplyNum] = useState(0);

  useEffect(() => {
    setInputSpeed(speed);
  }, [speed]);

  /**
   * @description 应用到所有片段
   * @returns incrementalTime 时间增量
   * @returns applyTemplate 可应用当前倍速的片段 设置为当前倍速之后的片段时间限定大于最短时长（TEMPLATE_MIN_DURATION）限制
   * */
  function checkAllTemplateTime(value: number): [number, TemplateData[]] {
    let incrementalTime = 0;
    const applyTemplate: TemplateData[] = [];
    templates.forEach(item => {
      const newPageTime = item.videoInfo.allAnimationTime * (1 / value);

      if (newPageTime > TEMPLATE_MIN_DURATION) {
        incrementalTime += newPageTime - item.videoInfo.allAnimationTimeBySpeed;
        applyTemplate.push(item);
      }
    });
    return [incrementalTime, applyTemplate];
  }

  // 确定设置倍速
  function onOk(applyTemplate: TemplateData[], value: number) {
    const index = getCurrentTemplateIndex();
    applyTemplate.forEach(item => {
      setTemplateSpeed(value, item);
    });
    setApplyNum(applyTemplate.length);

    setTimeout(() => {
      setCurrentTime(getTemplateTimeScale()[index][0], false);
    });
  }

  function checkSpeed(value: number) {
    const newPageTime = allAnimationTime * (1 / value);
    clickActionWeblog('speed_001');

    if (newPageTime < TEMPLATE_MIN_DURATION) {
      setInputSpeed(speed);
      message.info(
        `抱歉，因为设置倍速后视频时长小于${
          TEMPLATE_MIN_DURATION / 1000
        }秒，无法使用倍速功能`,
      );
      return;
    }

    let incrementalTime = newPageTime - allAnimationTimeBySpeed;
    let applyTemplate: TemplateData[] = [template];
    if (applyAll) {
      [incrementalTime, applyTemplate] = checkAllTemplateTime(value);
    }

    if (checkTotalTime({ incrementalTime })) {
      setInputSpeed(speed);
    } else {
      onOk(applyTemplate, value);
    }
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
        defaultValue={speed}
        step={0.1}
        min={0.5}
        max={2.5}
        value={inputSpeed}
        onChange={setInputSpeed}
        onAfterChange={checkSpeed}
        // marks={{ 0.5: '0.5', 1: '1', 1.5: '1.5', 2: '2', 2.5: '2.5' }}
        marks={{ 0.5: '0.5x', 1: '', 1.5: '', 2: '', 2.5: '2.5x' }}
      />

      {templates.length > 1 && (
        <div>
          <Checkbox
            checked={applyAll}
            onChange={e => {
              clickActionWeblog('speed_002');
              const { checked } = e.target;
              if (checked) {
                clickActionWeblog('speed_002');
                const [incrementalTime, applyTemplate] =
                  checkAllTemplateTime(inputSpeed);

                if (!checkTotalTime({ incrementalTime })) {
                  setApplyAll(checked);
                  onOk(applyTemplate, inputSpeed);
                }
              } else {
                setApplyAll(checked);
              }
            }}
          >
            适用于其他的片段
          </Checkbox>

          {applyAll && (
            <div className="applyAll">
              已有「{applyNum}」个片段应用当前倍速.
            </div>
          )}
        </div>
      )}
    </div>
  );
});
