import {
  CSSProperties,
  forwardRef,
  PropsWithChildren,
  Ref,
  useRef,
} from 'react';

import MusicNode from '@/pages/SidePanel/MusicPanel/componts/SetMusicNode';

import { useSetMusic } from '@/hooks/useSetMusic';

import InfiniteLoader, {
  InfiniteLoaderRef,
  InfiniteLoaderProps,
} from '@/components/InfiniteLoader';

interface ParamsItem {
  keyword?: string;
  class_id?: number;
  reload?: boolean;
  sourceType?: string;
}

interface MusicListProps extends InfiniteLoaderProps {
  param?: ParamsItem;
  request: any;
  deleteMusicReq?: any;
  playingId?: string;
  setPlayingId: (id: string | undefined) => void;
  className?: string;
  style?: CSSProperties;
  mockList: any[];
  reload: () => void;
}

function MyMusicList(
  props: PropsWithChildren<MusicListProps>,
  ref: Ref<InfiniteLoaderRef>,
) {
  const {
    param,
    request,
    deleteMusicReq,
    playingId,
    setPlayingId,
    mockList,
    reload,
    ...others
  } = props;

  const { audioList, bindAddAudio, bindReplaceAudio } = useSetMusic();
  function handleReload() {
    ref?.current?.reload();
    reload();
  }
  function format(item: any) {
    if (item?.fileInfo) {
      item.preview = item?.fileInfo.file_path;
      item.cover_url = item?.fileInfo.cover_path;
      if (item?.fileInfo?.values?.duration) {
        item.total_time = item?.fileInfo?.values?.duration * 1000;
        return item;
      }
    }
    if (item.file_id) {
      item.id = item.file_id;
    }
    item.total_time = 0;
    // 1-上传，2-AI文字转语音，3-录音，undefine-云端音乐
    item.source_type = item.is_recording === 1 ? 3 : 1;
    return item;
  }
  return (
    <div
      style={{
        marginBottom: 18,
        flex: 1,
        height: 0,
        position: 'relative',
      }}
    >
      {/* <div>
        <Empty
          className="empty-wrap"
          image={ossPath('/image/Icon/1662431803098.png')}
          description={<div className="empty-desc">你还未上传你的音频</div>}
        />
      </div> */}
      <InfiniteLoader
        ref={ref}
        emptyDesc="你还未上传你的音频"
        isEmpty={mockList.length == 0}
        request={request}
        params={{ pageSize: 30 }}
        skeleton={{ rows: 4, columns: 1 }}
        {...others}
      >
        {({ list }) => {
          const newList = [...mockList, ...list];
          return (
            <>
              {newList.map(value => (
                <MusicNode
                  key={value.id}
                  value={format(value)}
                  playingId={playingId}
                  setPlayingId={setPlayingId}
                  audioList={audioList}
                  bindAddAudio={bindAddAudio}
                  bindReplaceAudio={bindReplaceAudio}
                  deleteMusicReq={deleteMusicReq}
                  reload={handleReload}
                />
              ))}
            </>
          );
        }}
      </InfiniteLoader>
    </div>
  );
}

export default forwardRef(MyMusicList);
