import { forwardRef, useState, useEffect } from 'react';
import InfiniteLoader from '@/components/InfiniteLoader';
import SetMusicNode from '@/pages/SidePanel/MusicPanel/componts/SetMusicNode';
import { getSearchList, getTagList } from '@/api/music';
import { useLeftSideInfo } from '@/store/adapter/useGlobalStatus';
import { useSetMusic } from '@/hooks/useSetMusic';
import { useRequest } from 'ahooks';
import classNames from 'classnames';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.module.less';

function More() {
  const { leftSideInfo, openSidePanel } = useLeftSideInfo();
  const { audioList, bindAddAudio, bindReplaceAudio } = useSetMusic();
  const [categories, setCategories] = useState<any[]>([]);
  const [subFilter, setSubFilter] = useState<string>('');
  const [class_name, moreClass_id = ''] =
    leftSideInfo.submenu?.split('-') || [];
  // //  获取音乐分类列表
  const { loading, run } = useRequest(
    () => getTagList(leftSideInfo.params?.classId),
    {
      manual: true,
      onSuccess(data) {
        const list = data || [];
        if (data.length > 0) {
          list.unshift({
            pid: '',
            class_name: '全部',
          });
        }
        setCategories(list);
      },
      onError: err => {
        console.log('出错啦！！列表加载失败', err);
      },
    },
  );
  useEffect(() => {
    if (leftSideInfo?.params?.classId) {
      run();
    } else {
      setCategories([]);
    }
    setSubFilter('');
  }, [leftSideInfo?.params]);
  return (
    <div className={styles['music-search-more']}>
      <div
        className={styles['class-name']}
        onClick={() => {
          openSidePanel();
        }}
      >
        {'<'}
        {class_name}
      </div>

      {categories.length > 0 && (
        <div
          className={classNames(
            styles['music-filter'],
            styles['music-filter-sub'],
          )}
        >
          {categories.map((item, index) => {
            return (
              <div
                className={classNames(styles['music-filter-item'], {
                  [styles['music-filter-item-choosed']]: subFilter === item.pid,
                })}
                key={item.pid}
                onClick={() => {
                  setSubFilter(item.pid);
                  clickActionWeblog('action_music_filter', {
                    action_label: JSON.stringify({
                      class_id: item.pid,
                      p_id: '1026',
                    }),
                  });
                }}
              >
                {item.class_name}
              </div>
            );
          })}
        </div>
      )}
      <InfiniteLoader
        request={getSearchList}
        params={{
          keyword: '',
          filter_id: leftSideInfo.params?.filterId || '',
          class_id:
            subFilter === '' ? leftSideInfo.params?.classId || '' : subFilter,
          resource_flag: leftSideInfo.params?.resourceFlag || 'GA',
          pageSize: 20,
        }}
        skeleton={{ rows: 4, columns: 1 }}
        className={styles['music-search-list']}
      >
        {({ list }) => {
          return (
            <>
              {list.map(value => (
                <SetMusicNode
                  audioList={audioList}
                  bindAddAudio={bindAddAudio}
                  bindReplaceAudio={bindReplaceAudio}
                  key={value.id}
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

export default forwardRef(More);
