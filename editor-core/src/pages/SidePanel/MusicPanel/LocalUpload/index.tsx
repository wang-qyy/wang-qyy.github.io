import { PropsWithChildren, useRef, useState } from 'react';
import { XiuIcon } from '@/components';
import { useMusicStatus } from '@/store/adapter/useMusicStatus';
import { getMyAudio, getDeleteMyAudio } from '@/api/music';
import { clickActionWeblog } from '@/utils/webLog';
import { useUserBindPhoneModal } from '@/store/adapter/useGlobalStatus';
import { getUserInfo } from '@/store/adapter/useUserInfo';
import { deepCloneJson } from '@/kernel/utils/single';
import UploadAudio from '../componts/UploadAudio';
import MusicList from './list';
import styles from './index.less';
import RecorderWarn from '../RecordModal/component/warn';
import RecorderCmp from '../RecordModal/component/recorder';
import SetMusicNode from '../componts/SetMusicNode';

interface LocalUploadProps {
  playingId?: string;
  setPlayingId: (id: string | undefined) => void;
}

const LocalUpload = ({
  playingId,
  setPlayingId,
}: PropsWithChildren<LocalUploadProps>) => {
  const { musicStatus } = useMusicStatus();
  const { isModalVisible } = musicStatus;

  const uploadAudioRef = useRef(null);
  const { showBindPhoneModal } = useUserBindPhoneModal();
  // 正在上传的数据
  const [mockList, setMockList] = useState<any[]>([]);
  // {
  //   id: 'rc-upload-1663641824143-2',
  //   title: '15.mp3',
  //   total_time: 0,
  //   progress: 93,
  //   fileState: 0,
  // },
  const [visible, setVisible] = useState(false);
  const [warnVisible, setWarnVisible] = useState(false); // 麦克风授权警告

  const gituploadId = () => {
    uploadAudioRef.current?.reload();
    setMockList([]);
  };
  // 判断是否授权 麦克风
  const impower = () => {
    if (navigator.mediaDevices.getUserMedia) {
      const constraints = { audio: true };
      navigator.mediaDevices.getUserMedia(constraints).then(
        stream => {
          setWarnVisible(false);
          setVisible(true);
        },
        () => {
          setWarnVisible(true);
          // 触发无录音设备埋点
          clickActionWeblog('mike_audio_004');
          setTimeout(() => {
            setWarnVisible(false);
          }, 2000);
        },
      );
    } else {
      console.error('浏览器不支持 getUserMedia');
    }
  };
  const onChoose = (data: any) => {
    if (data?.file) {
      const list = deepCloneJson(mockList);
      const index = mockList.findIndex(item => {
        return (item.id = data.file.uid);
      });
      const mockData = {
        id: data?.file.uid,
        title: data?.file.name,
        total_time: 0,
        fileInfo: undefined,
        progress: data.progress,
        fileState: data.fileState,
      };
      if (index > -1) {
        list[index] = mockData;
      } else {
        list.push(mockData);
      }
      setMockList(list);
    } else {
      setMockList([data]);
    }
  };
  return (
    <div className={styles.localUpload}>
      <div className={styles.localUploadTop}>
        <UploadAudio gituploadId={gituploadId} onChoose={onChoose}>
          <div className={styles.topItem}>
            <XiuIcon type="iconshangchuan" className={styles.topItemIcon} />
            上传
          </div>
        </UploadAudio>
        <div
          className={styles.topItem}
          onClick={() => {
            if (getUserInfo()?.bind_phone !== 1) {
              showBindPhoneModal();
            } else {
              impower();
            }
            // 点击录音埋点
            clickActionWeblog('mike_audio_001');
          }}
        >
          <XiuIcon type="icona-luyin" className={styles.topItemIcon} />
          录音
        </div>
      </div>
      {visible && !warnVisible && (
        <RecorderCmp
          onChange={() => {
            uploadAudioRef.current?.reload();
            setVisible(false);
          }}
        />
      )}
      {warnVisible && <RecorderWarn />}
      {!isModalVisible && (
        <MusicList
          mockList={mockList}
          ref={uploadAudioRef}
          param={{}}
          request={getMyAudio}
          deleteMusicReq={getDeleteMyAudio}
          playingId={playingId}
          setPlayingId={setPlayingId}
          reload={() => {
            setMockList([]);
          }}
        />
      )}
    </div>
  );
};

export default LocalUpload;
