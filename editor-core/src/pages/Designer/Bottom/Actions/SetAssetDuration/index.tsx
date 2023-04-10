import { useState, useLayoutEffect } from 'react';
import { Popover, Button, Input, InputNumber } from 'antd';
import {
  isTempModuleType,
  useGetCurrentAsset,
  AssetClass,
  observer,
} from '@hc/editor-core';
import { reportChange } from '@kernel/utils/config';

import { stopPropagation } from '@/utils/single';

import { formatTime } from '@/pages/Content/Bottom/handler';

import { Item } from '../index';

import './index.less';

const STEP = 400;

const InputTime = observer(
  (props: { asset: AssetClass; onClose: () => void }) => {
    const { asset, onClose } = props;
    const { minAssetDuration } = asset;

    const { startTime, endTime } = asset.assetDuration;
    const time = Number(((endTime - startTime) / 1000).toFixed(1));

    const [inputValue, setInputValue] = useState(0); // 毫秒

    useLayoutEffect(() => {
      setInputValue(endTime - startTime);
    }, [startTime, endTime]);

    function formatInputTime(inputValue?: string | number) {
      const input = String(inputValue).split(':');

      let m = '0';
      let s = '0';
      if (input.length === 2) {
        [m, s] = input;
      } else if (input.length === 1) {
        [s] = input;
      }

      if (Number(m) >= 0 && parseFloat(s)) {
        let inputTime = Number(m) * 60000 + parseFloat(s) * 1000;
        const pageTime = asset.template?.videoInfo.allAnimationTime || 0;

        let maxDuration = pageTime - startTime;

        if (inputTime < minAssetDuration) {
          inputTime = minAssetDuration;
        } else {
          if (asset?.videoClip.totalTime) {
            const { cst, totalTime } = asset.videoClip;
            maxDuration = Math.min(totalTime - cst, maxDuration);
          }

          if (inputTime > maxDuration) {
            inputTime = maxDuration;
          }
        }

        return Number(inputTime);
      }

      return time;
    }

    function handleInput(value: number) {
      const input = formatInputTime(value);
      setInputValue(input);
    }

    function onOk(value?: number) {
      asset.updateAssetDuration({
        startTime,
        endTime: startTime + (value ?? inputValue),
      });

      reportChange('updateAssetDuration', true);
    }

    return (
      <div style={{ padding: '8px 10px', display: 'flex' }}>
        <Input.Group compact>
          <span
            className="action"
            onClick={() => handleInput((inputValue - STEP) / 1000)}
          >
            -
          </span>
          <InputNumber
            autoFocus
            onFocus={e => e.target.select()}
            value={formatTime(inputValue)}
            className="input-number"
            onPaste={stopPropagation}
            onBlur={value => {
              handleInput(value.target.value);
            }}
            onKeyDown={e => {
              stopPropagation(e);

              if (e.code === 'Enter') {
                onOk(formatInputTime(e.target.value));
                onClose();
              }
            }}
          />
          <span
            className="action"
            onClick={() => handleInput((inputValue + STEP) / 1000)}
          >
            +
          </span>
        </Input.Group>
        <Button
          type="primary"
          size="small"
          style={{ marginLeft: 6, height: 30 }}
          onClick={() => {
            onOk();
            onClose();
          }}
        >
          确定
        </Button>
      </div>
    );
  },
);

export default function SetAssetDuration() {
  const asset = useGetCurrentAsset();

  const [visible, setVisible] = useState(false);

  if (
    !asset ||
    isTempModuleType(asset) ||
    (asset.parent && isTempModuleType(asset.parent))
  ) {
    return <></>;
  }

  const { startTime = 0, endTime = 0 } = asset.assetDuration;

  const time = Number(((endTime - startTime) / 1000).toFixed(1));

  return (
    <Popover
      destroyTooltipOnHide
      placement="top"
      trigger="click"
      visible={visible}
      onVisibleChange={setVisible}
      content={<InputTime asset={asset} onClose={() => setVisible(false)} />}
    >
      <Item
        item={{
          key: 'assetDuration',
          name: `${time}s`,
          icon: 'icontime',
          onClick() {
            setVisible(!visible);
          },
        }}
      />
    </Popover>
  );
}
