import { observer } from 'mobx-react';
import { useState } from 'react';
import MusicNode, {
  MusicNodeValue,
} from '@/pages/SidePanel/MusicPanel/componts/SetMusicNode';
import { useSetMusic } from '@/hooks/useSetMusic';
import { ItemData } from '@/pages/SidePanel/Upload/FileItem';
import { FileInfo } from '@/pages/SidePanel/Upload/typing';
import { BaseMultipleAudio, formatAudio, MultipleAudio } from '@/kernel';
import { useAssetReplaceModal } from '@/store/adapter/useGlobalStatus';

import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.less';

interface IProps {
  type: 'local' | 'cloud';
  data: MusicNodeValue;
}

const AudioItem: React.FC<IProps> = props => {
  const { data } = props;
  const {
    close: closeAssetReplaceModal,
    value: { playId },
    setPlayId,
  } = useAssetReplaceModal();

  const { bindSetBgAudios } = useSetMusic();

  return (
    <div className={styles.audioItem}>
      <MusicNode
        value={data}
        className={styles.audioItemNode}
        isReplace
        bindAddAudio={data => {
          bindSetBgAudios([formatAudio(data) as MultipleAudio]);
          closeAssetReplaceModal();
          clickActionWeblog('concise22');
        }}
        playingId={playId}
        setPlayingId={setPlayId}
        // resId={file_id}
        // playingId={playingId}
        // setPlayingId={setPlayingId}
        // audioList={audioList}
        // bindReplaceAudio={bindReplaceAudio}
        // deleteMusicReq={deleteMusicReq}
        // reload={handleReload}
      />
    </div>
  );
};

export default observer(AudioItem);
