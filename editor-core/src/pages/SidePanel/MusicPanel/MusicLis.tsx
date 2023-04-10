import { CSSProperties, forwardRef, PropsWithChildren, Ref } from 'react';

import MusicNode from '@/pages/SidePanel/MusicPanel/componts/SetMusicNode';

import { useSetMusic } from '@/hooks/useSetMusic';
import { clickActionWeblog } from '@/utils/webLog';

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
}

function MusicList(
  props: PropsWithChildren<MusicListProps>,
  ref: Ref<InfiniteLoaderRef>,
) {
  const { param, request, deleteMusicReq, playingId, setPlayingId, ...others } =
    props;

  const { audioList, bindAddAudio, bindReplaceAudio } = useSetMusic();

  function handleReload() {
    ref?.current?.reload();
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
      <InfiniteLoader
        ref={ref}
        request={request}
        params={param}
        skeleton={{ rows: 4, columns: 1 }}
        {...others}
      >
        {({ list }) => {
          return (
            <>
              {list.map(value => (
                <MusicNode
                  key={value.id}
                  value={value}
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

export default forwardRef(MusicList);
