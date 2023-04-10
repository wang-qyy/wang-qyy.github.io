import { useRef, useState, useEffect } from 'react';
import { Popover, Input } from 'antd';
import { RGBA } from '@hc/editor-core';
import ColorPickup from '@/components/ColorPickup';
import GradientColor from '../../../../GradientColor/index';
import './index.module.less';
import EffectImage from './EffectImage';

interface EffectMachineItemProps {
  type: string;
  background: string;
  color: RGBA | string;
  onChange: (param: any) => void;
}
const EffectMachineItem = (props: EffectMachineItemProps) => {
  // 'image':图片, 'color':纯色, 'gradient'：渐变色
  const { type, background, color, onChange } = props;
  const [colorPopover, setColorPopover] = useState(false);
  const container = document.querySelector('.xiudodo-main') as HTMLDivElement;

  const containterRef = useRef(null);
  const PopoverContent = () => {
    switch (type) {
      case 'color': {
        return (
          <div style={{ width: '250px', padding: '10px' }}>
            <ColorPickup
              color={color}
              onChange={(color: { rgb: RGBA }) => {
                onChange(color.rgb);
              }}
            />
          </div>
        );
      }
      case 'gradient': {
        return (
          <GradientColor
            type="effect"
            value={color}
            onChange={val => {
              onChange(val);
            }}
          />
        );
      }
      case 'image': {
        return (
          <EffectImage
            defaultUrl={background}
            onChange={url => {
              onChange(url);
            }}
          />
        );
      }
    }
  };

  useEffect(() => {
    if (container) {
      container.addEventListener('mouseup', () => {
        setColorPopover(false);
      });
      return () => {
        container.removeEventListener('mouseup', () => {
          setColorPopover(false);
        });
      };
    }
  }, [container]);

  return (
    <div ref={containterRef} className="machine-item-container">
      <Popover
        trigger="click"
        visible={colorPopover}
        onVisibleChange={visible => {
          setColorPopover(visible);
        }}
        destroyTooltipOnHide
        content={PopoverContent()}
        title=""
        overlayClassName="container-no-arrow"
        placement="bottom"
      >
        {type === 'image' && (
          <div
            className="machine-item"
            onClick={() => {
              setColorPopover(!colorPopover);
            }}
          >
            <div
              style={{
                background: `url(${background}) center center no-repeat`,
              }}
            />
          </div>
        )}
        {type === 'gradient' && (
          <div
            className="machine-item"
            onClick={() => {
              setColorPopover(!colorPopover);
            }}
          >
            <div
              style={{
                backgroundImage: background,
                width: 'auto',
                height: '100%',
              }}
            />
          </div>
        )}
        {type === 'color' && (
          <div
            className="machine-item"
            onClick={() => {
              setColorPopover(!colorPopover);
            }}
            style={{ background }}
          />
        )}
      </Popover>
    </div>
  );
};
export default EffectMachineItem;
