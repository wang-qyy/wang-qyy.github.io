import React, { CSSProperties, SyntheticEvent } from 'react';
import { observer } from 'mobx-react';
import { Space, Button, Divider, Slider } from 'antd';

type ImageClipperToolProps = {
  style: CSSProperties;
  value: number;
  onChange: (value: number) => void;
  onOk: (e: SyntheticEvent) => void;
  onCancel: (e: SyntheticEvent) => void;
  onReset: (e: SyntheticEvent) => void;
};

function ImageClipperTool({
  style,
  value,
  onChange,
  onOk,
  onCancel,
  onReset,
}: ImageClipperToolProps) {
  return (
    <div className="hc-AIC-tools" style={style}>
      <div className="hc-AIC-tools-inner">
        <Space size={'middle'}>
          <span>缩放</span>
          <Slider
            tipFormatter={(value: number | undefined) => `${value ?? 0}%`}
            value={value}
            onChange={onChange}
            min={1}
            max={300}
            step={1}
          />
        </Space>
        <Divider type="vertical" style={{ height: '100%' }} />
        <Space split={<Divider type="vertical" />} size={0}>
          <Button className="hc-black-color" onClick={onReset} type={'link'}>
            重置
          </Button>
          <Button className="hc-black-color" onClick={onCancel} type={'link'}>
            取消
          </Button>
          <Button type={'link'} onClick={onOk}>
            完成
          </Button>
        </Space>
      </div>
    </div>
  );
}

export default observer(ImageClipperTool);
