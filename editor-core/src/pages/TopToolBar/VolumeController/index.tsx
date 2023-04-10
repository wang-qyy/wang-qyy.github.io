import { CSSProperties, PropsWithChildren } from 'react';
import { Tooltip } from 'antd';
import {
  useVideoEVoicedByObserver,
  useVideoEVolumeByObserver,
  observer,
  toJS,
} from '@hc/editor-core';

import OverwritePopover from '@/components/OverwritePopover';
import OverwriteSlider from '@/components/OverwriteSlider';
import XiuIcon from '@/components/XiuIcon';

import { useVideoVolumeController } from '@/store/adapter/useGlobalStatus';

interface VolumeControllerProps {
  className?: string;
  style?: CSSProperties;
}

export default observer(
  ({ className, ...others }: PropsWithChildren<VolumeControllerProps>) => {
    const [voiced, setVoiced] = useVideoEVoicedByObserver();
    const [volume, setVolume] = useVideoEVolumeByObserver();
    const { value, open, close } = useVideoVolumeController();

    // 声音设置
    const renderVoice = (
      <OverwriteSlider
        colon={false}
        label={
          <span
            style={{ fontSize: 18, cursor: 'pointer' }}
            onClick={() => {
              setVoiced(!voiced);
              if (!volume) {
                setVolume(100);
              }
            }}
          >
            <XiuIcon
              className="xiuIcon font-18"
              type={voiced ? 'volume-small' : 'volume-mute'}
            />
          </span>
        }
        value={voiced ? volume : 0}
        onChange={value => {
          setVoiced(!!value);
          setVolume(value);
        }}
        inputNumber
        style={{ width: 336, padding: '12px 18px' }}
        tooltipVisible={false}
      />
    );

    return (
      <OverwritePopover
        placement="bottom"
        trigger="click"
        content={renderVoice}
        visible={value}
        onVisibleChange={visible => {
          if (visible) {
            open();
          } else {
            close();
          }
        }}
      >
        <div className={className} onClick={open} {...others}>
          <XiuIcon
            type={voiced ? 'volume-small' : 'volume-mute'}
            className="xiuIcon font-24"
          />
          {/* <span className="xiudd-tool-item-name">音量</span> */}
        </div>
      </OverwritePopover>
    );
  },
);
