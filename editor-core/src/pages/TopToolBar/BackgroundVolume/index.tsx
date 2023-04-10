import { CSSProperties, PropsWithChildren } from 'react';
import { observer, useSetTemplateBackgroundAsset } from '@hc/editor-core';

import OverwriteSlider from '@/components/OverwriteSlider';
import XiuIcon from '@/components/XiuIcon';

interface VolumeControllerProps {
  className?: string;
  style?: CSSProperties;
}

export default observer((props: PropsWithChildren<VolumeControllerProps>) => {
  const { setVolume, setVoiced, value } = useSetTemplateBackgroundAsset();

  const { volume, voiced } = value?.attribute || {};

  return (
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
        setVolume(value);
      }}
      inputNumber
      style={{ width: 336, padding: '12px 18px' }}
      tooltipVisible={false}
    />
  );
});
