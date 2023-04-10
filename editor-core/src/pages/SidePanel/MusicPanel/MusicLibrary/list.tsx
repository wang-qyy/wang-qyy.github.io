import {
  CSSProperties,
  forwardRef,
  PropsWithChildren,
  Ref,
  useEffect,
  useState,
} from 'react';
import { Radio, Tabs } from 'antd';
import InfiniteLoader from '@/components/InfiniteLoader';
import SetMusicNode from '@/pages/SidePanel/MusicPanel/componts/SetMusicNode';
import { getSearchList, getSearchListTotal } from '@/api/music';
import { useSetMusic } from '@/hooks/useSetMusic';
import { useRequest } from 'ahooks';
import styles from './index.module.less';

interface ListProps {
  keyword: string;
}

function List(props: ListProps) {
  const { keyword } = props;
  const { audioList, bindAddAudio, bindReplaceAudio } = useSetMusic();
  const [classId, setclassId] = useState('1025');
  const [total, setTotal] = useState();
  const { run } = useRequest(
    () =>
      getSearchListTotal({
        keyword,
        params: {
          '1025': {
            resource_flag: 'GA',
            class_id: '1025',
            filter_id: '',
          },
          '1026': {
            resource_flag: 'GA',
            class_id: '1026',
            filter_id: '',
          },
        },
      }),
    {
      manual: true,
      onSuccess: res => {
        setTotal(res);
      },
    },
  );
  useEffect(() => {
    run();
  }, [keyword]);

  return (
    <div className={styles['music-search']}>
      <Tabs
        defaultActiveKey="1025"
        tabPosition="top"
        className={styles['music-search-tabs']}
        onChange={value => {
          setclassId(value);
        }}
      >
        <Tabs.TabPane key="1025" tab={`音乐(${total && total['1025']})`} />
        <Tabs.TabPane key="1026" tab={`音效(${total && total['1026']})`} />
      </Tabs>
      <InfiniteLoader
        request={getSearchList}
        params={{
          keyword,
          class_id: classId,
          resource_flag: 'GA',
          pageSize: 20,
          filter_id: '',
        }}
        skeleton={{ rows: 4, columns: 1 }}
        className={styles['music-search-list']}
      >
        {({ list }) => {
          return (
            <>
              {list.map(value => (
                <SetMusicNode
                  key={value.id}
                  audioList={audioList}
                  bindAddAudio={bindAddAudio}
                  bindReplaceAudio={bindReplaceAudio}
                  value={{
                    ...value,
                    total_time: value.duration,
                    id: value.gid,
                    preview: value.url,
                    source_type: undefined,
                  }}
                />
              ))}
            </>
          );
        }}
      </InfiniteLoader>
    </div>
  );
}

export default forwardRef(List);
