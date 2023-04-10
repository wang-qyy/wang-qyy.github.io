import { getMyMusicList } from '@/api/music';
import InfiniteLoader, { InfiniteLoaderRef } from '@/components/InfiniteLoader';
import { useEffect, useRef, useState } from 'react';
import AIMusicItem from './item';

// AI文字转语音
const AIMusicList = (props: { reload: boolean }) => {
  const { reload } = props;

  const listRef = useRef<InfiniteLoaderRef>(null);
  const [playingId, setPlayingId] = useState<number | undefined>();

  function handleReload() {
    // 重新请求数据
    listRef.current?.reload();
  }

  useEffect(() => {
    handleReload();
  }, [reload]);

  return (
    <InfiniteLoader
      ref={listRef}
      request={getMyMusicList}
      emptyDesc="当前无文字转语音文件"
      skeleton={{ rows: 4, columns: 1 }}
    >
      {({ list }) => {
        return (
          <>
            {list.map(item => (
              <AIMusicItem
                key={item.id}
                playingId={playingId}
                setPlayingId={setPlayingId}
                data={item}
                onChange={handleReload}
              />
            ))}
          </>
        );
      }}
    </InfiniteLoader>
  );
};
export default AIMusicList;
