import { useState } from 'react';
import { useMusicStatus } from '@/store/adapter/useMusicStatus';
import UploadAudio from '@/pages/SetupSound/UploadAudio';
import { message } from 'antd';
import { XiuIcon } from '@/components';
import { getUploadMusicList, getDeleteMyAudio } from '@/api/music';

import classnames from 'classnames';
import TextToSpeech from '@/pages/SetupSound/TextToSpeech';
import MusicList from '@/pages/SidePanel/MusicPanel/MusicLis';
import styles from './index.less';

const MyMusic = () => {
  const { updateMusicStatus } = useMusicStatus();
  const [uploadId, setUploadId] = useState(0);

  const gituploadId = (value: any) => {
    setUploadId(value);
  };

  return (
    <div className={styles.MyMusic}>
      <div className={styles.MyMusicTop}>
        <MusicList
          containerClassName={styles.MyMusicTopList}
          itemStyle={{ width: '47.5%' }}
          request={getUploadMusicList}
          uploadId={uploadId}
          deleteMusicReq={getDeleteMyAudio}
        />
      </div>

      <div className={styles.MyMusicBottom}>
        <UploadAudio gituploadId={gituploadId}>
          <div className={classnames(styles.MyMusicBottomItem)}>
            <XiuIcon type="iconshangchuan" className={styles.topItemIcon} />
            上传
          </div>
        </UploadAudio>
      </div>
      <TextToSpeech />
    </div>
  );
};

export default MyMusic;
