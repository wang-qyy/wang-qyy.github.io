import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Input } from 'antd';
import { useDebounceFn } from 'ahooks';

import {
  setFadeIn,
  setFadeOut,
  observer,
  usePlayHandlerByObserver,
} from '@hc/editor-core';

import { clickActionWeblog } from '@/utils/webLog';
import { useSetMusic } from '@/hooks/useSetMusic';
import { copyAndPasteAudio } from '@/CommonModule/Audios/handler';
import { stopPropagation } from '@/utils/single';
import { useSplitAudio } from '@/utils/audioHandler';

import {
  useSetActiveAudio,
  useSetVolumeController,
  updateAudioFade,
  updateAudioVolume,
  useSpeedController,
} from '@/store/adapter/useAudioStatus';

import OverwriteSlider from '@/components/OverwriteSlider';
import OverwritePopover from '@/components/OverwritePopover';

import SpeedSetting from './SpeedSetting';
import Item, { ItemData } from '../Item';

interface InputNumberProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function InputNumber({ value, onChange, label }: InputNumberProps) {
  const [inputValue, setInputValue] = useState(0);

  useEffect(() => {
    setInputValue(Number((value / 1000).toFixed(1)));
  }, [value]);

  function handleChange(num: string | number) {
    let newValue = Number(parseFloat(String(num)));

    if (newValue > 5) {
      newValue = 5;
    } else if (newValue < 0) {
      newValue = 0;
    }

    onChange(newValue * 1000);
    setInputValue(newValue);
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{label}</span>
        <Input
          value={inputValue}
          style={{ width: 60 }}
          size="small"
          suffix="s"
          onChange={e => setInputValue(e.target.value)}
          onBlur={e => handleChange(e.target.value)}
          onKeyDown={stopPropagation}
        />
      </div>
      <OverwriteSlider
        value={value}
        tooltipVisible={false}
        max={5000}
        onChange={v => handleChange(v / 1000)}
      />
    </>
  );
}

function AudioActions() {
  const { isPlaying } = usePlayHandlerByObserver();
  const {
    activeAudio = {},
    updateActiveAudio,
    setActiveAudioInCliping,
    inCliping,
  } = useSetActiveAudio();
  const { bindSetVolume, bindRemoveAudio } = useSetMusic();
  const { visible: volumeController, setVolumeController } =
    useSetVolumeController();
  const { visible: speedVisible, setSpeedController: setSpeedVisible } =
    useSpeedController();
  const { disabled: disabledSplit, splitAudio } = useSplitAudio();

  const { fadeIn = 0, fadeOut = 0, rt_id } = activeAudio;
  const [fade, setFade] = useState(false);

  function handleDelete() {
    clickActionWeblog('quick_bar_004');
    bindRemoveAudio(rt_id);
  }

  function handleCopy() {
    copyAndPasteAudio();
    clickActionWeblog('quick_bar_005');
  }

  // 清除其他状态 因为父级元素 阻止冒泡父级的blur 导致清除状态不正常需要手动清
  function clear() {
    setFade(false);
    setVolumeController(false);
    setSpeedVisible(false);
    setActiveAudioInCliping(-1);
  }

  useEffect(() => {
    if (isPlaying) {
      setFade(false);
      setVolumeController(false);
      setSpeedVisible(false);
    }
  }, [isPlaying]);

  const webLog = useDebounceFn(
    () => {
      clickActionWeblog('quick_bar_002');
    },
    { wait: 500 },
  );

  // 音量
  const renderVolume = (
    <div onMouseDown={stopPropagation}>
      <OverwriteSlider
        label="音量"
        value={activeAudio.volume}
        onChange={value => {
          bindSetVolume(value, rt_id);
          updateAudioVolume(value);
          webLog.run();
        }}
        inputNumber
        style={{ width: 336, padding: '12px 18px' }}
        tooltipVisible={false}
      />
    </div>
  );

  // 音效
  const renderFade = (
    <div style={{ width: 280, padding: 16 }} onMouseDown={stopPropagation}>
      <InputNumber
        label="淡入"
        value={fadeIn}
        onChange={value => {
          setFadeIn(value, rt_id);
          updateAudioFade({ fadeIn: value });
        }}
      />
      <InputNumber
        label="淡出"
        value={fadeOut}
        onChange={value => {
          setFadeOut(value, rt_id);
          updateAudioFade({ fadeOut: value });
        }}
      />
    </div>
  );

  const actions: ItemData[] = [
    {
      key: 'volume',
      name: '音量',
      icon: 'iconbx_bx-volume-full',
      disabled: false,
      active: volumeController,
      onClick() {
        clear();
        setVolumeController(true);
      },
    },
    {
      key: 'copy',
      name: '复制',
      icon: 'icona-Frame6',
      disabled: false,
      onClick() {
        clear();
        handleCopy();
      },
    },
    {
      key: 'delete',
      name: '删除',
      icon: 'iconicons8_trash',
      onClick() {
        clear();
        handleDelete();
      },
    },
    {
      key: 'adjust',
      name: '调整',
      icon: 'iconjianji',
      onClick() {
        clear();
        clickActionWeblog('quick_bar_003');
        setActiveAudioInCliping(activeAudio.trackIndex);
      },
      active: inCliping > -1,
    },
    {
      key: 'split',
      name: '分割',
      icon: 'iconGroup',
      tooltip: '分割音频',
      onClick(e) {
        clear();
        clickActionWeblog('quick_bar_006');
        splitAudio();
      },
      disabled: disabledSplit,
    },
    {
      key: 'fade',
      name: '音效',
      icon: 'iconyinxiao',
      active: fade,
      onClick() {
        clickActionWeblog('quick_bar_007');
        clear();
        setFade(true);
      },
    },
    {
      key: 'speed',
      name: '音乐倍速',
      icon: 'beisu',
      // active: fade,
      onClick() {
        clear();
        setSpeedVisible(true);
        clickActionWeblog('audioSpeed1');
        // clear();
        // setFade(true);
      },
    },
  ];

  function renderItem(item: ItemData) {
    switch (item.key) {
      case 'fade':
        return (
          <OverwritePopover
            trigger="click"
            content={renderFade}
            key={`templateActions-${item.key}`}
            visible={fade}
            onVisibleChange={v => {
              setFade(v);
            }}
          >
            <Item key={`templateActions-${item.key}`} item={item} />
          </OverwritePopover>
        );
      case 'volume':
        return (
          <OverwritePopover
            trigger="click"
            content={renderVolume}
            visible={volumeController}
            onVisibleChange={setVolumeController}
            key={`templateActions-${item.key}`}
          >
            <Item key={`templateActions-${item.key}`} item={item} />
          </OverwritePopover>
        );
      case 'speed':
        return (
          <OverwritePopover
            trigger="click"
            content={
              <div onMouseDown={stopPropagation}>
                <SpeedSetting />
              </div>
            }
            visible={speedVisible}
            onVisibleChange={setSpeedVisible}
            key={`templateActions-${item.key}`}
          >
            <Item key={`templateActions-${item.key}`} item={item} />
          </OverwritePopover>
        );
      default:
        return <Item key={`templateActions-${item.key}`} item={item} />;
    }
  }

  return <>{actions.map(item => renderItem(item))}</>;
}

export default observer(AudioActions);
