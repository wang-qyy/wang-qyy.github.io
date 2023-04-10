import { Button, message } from 'antd';
import { getAllAudios, observer, toJS } from '@hc/editor-core';
import { useSetActiveAudio, audioBlur } from '@/store/adapter/useAudioStatus';
import { useSetMusic } from '@/hooks/useSetMusic';
import { stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';
import XiuIcon from '@/components/XiuIcon';

import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';

import Item from './Item';

import './index.less';

function Audios() {
  const value = getAllAudios();
  const { activeAudio } = useSetActiveAudio();

  const { bindRemoveAudio } = useSetMusic();

  const { openSidePanel } = useLeftSideInfo();

  function handleClick(callback: () => void) {
    if (!activeAudio) {
      message.info('请选择要操作的音频');
      return;
    }
    callback();
  }

  return (
    <div className="simple-audio-wrap">
      <div
        className="simple-audio-list"
        onClick={() => {
          audioBlur();
        }}
      >
        <div style={{ width: '100%' }}>
          {value.length ? (
            value.map(audio => <Item key={audio.rt_id} audio={audio} />)
          ) : (
            <div
              className="simple-audio-empty"
              onClick={e => {
                stopPropagation(e);
                openSidePanel({ menu: 'music' });
              }}
            >
              <XiuIcon type="icontianjia" />
              添加音乐
            </div>
          )}
        </div>
      </div>

      <div className="audio-actions">
        <Button
          className="audio-action-delete"
          onClick={() =>
            handleClick(() => {
              audioBlur();
              clickActionWeblog('bottom_0009');
              bindRemoveAudio(activeAudio?.rt_id);
            })
          }
        >
          删除音乐
        </Button>
        <Button
          className="audio-action-replace"
          onClick={() =>
            handleClick(() => {
              clickActionWeblog('bottom_0010');
              openSidePanel({ menu: 'user-space' });
            })
          }
        >
          替换自己的音乐
        </Button>
        <Button
          className="audio-action-replace"
          onClick={() =>
            handleClick(() => {
              clickActionWeblog('bottom_0010');
              openSidePanel({ menu: 'music' });
            })
          }
        >
          替换云端的音乐
        </Button>
      </div>
    </div>
  );
}

export default observer(Audios);
