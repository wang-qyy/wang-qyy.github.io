import { Popover } from 'antd';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import {
  getCurrentAsset,
  useVideoEVoicedByObserver,
  useVideoEVolumeByObserver,
} from '@hc/editor-core';
import OverwriteSlider from '@/components/OverwriteSlider';
import { XiuIcon } from '@/components';

import commonStyles from '../common.modules.less';
import styles from './index.modules.less';
import StaticButton from '../StaticButton';

const Volume = () => {
  const [visible, _visible] = useState(false);

  const [volume, setVolume] = useVideoEVolumeByObserver();
  const [voiced, setVoiced] = useVideoEVoicedByObserver();
  const currentAsset = getCurrentAsset();

  useEffect(() => {
    _visible(false);
  }, [currentAsset]);

  return (
    <div className={commonStyles.item}>
      <Popover
        placement="bottom"
        trigger="click"
        visible={visible}
        onVisibleChange={_visible}
        className={styles.ColorPopover}
        content={
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
        }
      >
        <StaticButton
          text={volume ? '声音' : '静音'}
          iconType={volume ? 'volume-small' : 'volume-mute'}
        />
      </Popover>
    </div>
  );
};

export default observer(Volume);
