import { CSSProperties, PropsWithChildren, useEffect, useState } from 'react';
import { useOpacityByObserver, observer, toJS } from '@hc/editor-core';

import { useBackgroundSet } from '@/hooks/useBackgroundSet';
import OverwritePopover from '@/components/OverwritePopover';
import OverwriteSlider from '@/components/OverwriteSlider';
import XiuIcon from '@/components/XiuIcon';

interface VolumeControllerProps {
  className?: string;
  style?: CSSProperties;
  isBackground?: boolean;
}

export default observer(
  ({
    isBackground,
    className,
    ...others
  }: PropsWithChildren<VolumeControllerProps>) => {
    const [opacity, updateOpacity] = useOpacityByObserver();
    const { backgroundTransparent, backOpacity } = useBackgroundSet();
    const [visible, setVisible] = useState(false);

    // 当前透明度
    const value = isBackground ? backOpacity : opacity;

    // 不透明度
    const renderOpacityPopover = (
      <OverwriteSlider
        label="不透明度"
        value={value}
        onChange={value => {
          if (isBackground) {
            backgroundTransparent(value);
          } else {
            updateOpacity(value);
          }
        }}
        inputNumber
        style={{ width: 336, padding: '12px 18px' }}
        tooltipVisible={false}
      />
    );
    useEffect(() => {
      if (others.style?.display === 'none') {
        setVisible(false);
      }
    }, [others.style?.display]);

    return (
      <OverwritePopover
        placement="bottom"
        trigger="click"
        content={renderOpacityPopover}
        visible={visible}
        onVisibleChange={v => {
          setVisible(v);
        }}
      >
        <div
          className={className}
          {...others}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <XiuIcon type="butoumingdu" className="xiuIcon font-24" />
          {/* <span className="xiudd-tool-item-name">不透明度</span> */}
        </div>
      </OverwritePopover>
    );
  },
);
