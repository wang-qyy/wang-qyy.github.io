import { useState } from 'react';
import { Radio, Dropdown, Popover } from 'antd';
import { useRequest } from 'ahooks';
import Mold from '@/pages/Designer/Sider/components/Mold';
import Skeleton from '@/components/Skeleton';
import { getTagMusicList, getTagList } from '@/api/music';

import {
  useAssetReplaceModal,
  useLeftSideInfo,
} from '@/store/adapter/useGlobalStatus';
import classNames from 'classnames';
import { XiuIcon } from '@/components';
import { String } from 'lodash';
import { useSetMusic } from '@/hooks/useSetMusic';
import { stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.module.less';
import SetMusicNode, { MusicNodeValue } from '../componts/SetMusicNode';
import More from './more';

const MusicLibrary = (props: {
  filter_id: string;
  pid: string;
  resource_flag: string;
}) => {
  const { filter_id, pid, resource_flag } = props;
  const [categories, setCategories] = useState<any[]>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const { audioList, bindAddAudio, bindReplaceAudio } = useSetMusic();
  const { openSidePanel } = useLeftSideInfo();
  const {
    close: closeAssetReplaceModal,
    value: { playId },
    setPlayId,
  } = useAssetReplaceModal();
  // //  获取音乐分类列表
  useRequest(() => getTagList(pid), {
    onSuccess(data) {
      const list = data;
      list.unshift({
        pid: '',
        class_name: '全部',
      });
      setCategories(list);
    },
    onError: err => {
      console.log('出错啦！！列表加载失败', err);
    },
  });

  //  获取音乐列表
  const { data = [], loading } = useRequest(() => getTagMusicList(filter_id), {
    onError: err => {
      console.log('出错啦！！列表加载失败', err);
    },
  });
  return (
    <div className={styles['music-tabs-item']}>
      {categories && (
        <div className={styles['music-filter']}>
          {categories.map((item, index) => {
            if (index > 3) {
              return null;
            }
            return (
              <div
                className={classNames(styles['music-filter-item'], {
                  [styles['music-filter-item-choosed']]: item.pid === '',
                })}
                key={item.pid}
                onClick={() => {
                  if (item.pid !== '') {
                    openSidePanel({
                      submenu: `${item.class_name}-${item.pid}`,
                      params: {
                        classId: item.pid,
                        resourceFlag: resource_flag,
                      },
                    });
                    clickActionWeblog('action_music_filter', {
                      action_label: JSON.stringify({
                        class_id: item.pid,
                        p_id: pid,
                      }),
                    });
                  }
                }}
              >
                {item.class_name}
              </div>
            );
          })}
          {categories.length > 4 && (
            <Popover
              visible={visible}
              placement="bottom"
              trigger="click"
              destroyTooltipOnHide
              overlayClassName={styles['music-filter-dropdown']}
              content={
                categories.length > 4 ? (
                  <div className={styles['music-filter-dropdown-wrap']}>
                    {categories.map((item, index) => {
                      if (index <= 3) {
                        return null;
                      }
                      return (
                        <div
                          className={styles['music-filter-item']}
                          style={{ marginLeft: 10, width: 68, maxWidth: 68 }}
                          key={item.pid}
                          onClick={() => {
                            if (item.pid !== '') {
                              openSidePanel({
                                submenu: `${item.class_name}-${item.pid}`,
                                params: {
                                  classId: item.pid,
                                  resourceFlag: resource_flag,
                                },
                              });
                              clickActionWeblog('action_music_filter', {
                                action_label: JSON.stringify({
                                  class_id: item.pid,
                                  p_id: pid,
                                }),
                              });
                            }
                          }}
                        >
                          {item.class_name}
                        </div>
                      );
                    })}
                  </div>
                ) : null
              }
              onVisibleChange={setVisible}
            >
              <div
                className={classNames(
                  styles['music-filter-more'],
                  styles['music-filter-item'],
                )}
                onClick={e => {
                  setVisible(pre => !pre);
                  stopPropagation(e);
                }}
              >
                更多{' '}
                <XiuIcon
                  type="iconxiala"
                  style={{ fontSize: 10, transform: 'scale(0.7)' }}
                />
              </div>
            </Popover>
          )}
        </div>
      )}

      <Skeleton
        loading={loading}
        title
        more
        columns={2}
        rows={5}
        style={{ overflowY: 'auto', overflowX: 'hidden' }}
      >
        {(data?.items || []).map(({ name, id, list }: any) => (
          <Mold
            key={`class_name-${id}`}
            title={name}
            style={{ fontSize: 12, color: '#262E48', lineHeight: '40px' }}
            extraContent={
              <div
                className={styles.more}
                onClick={() => {
                  openSidePanel({
                    submenu: `${name}-${id}`,
                    params: { filterId: id, resourceFlag: resource_flag },
                  });
                  clickActionWeblog('action_music_more', { action_label: id });
                }}
              >
                更多{'>'}
              </div>
            }
            contentStyle={{
              display: 'block',
              gridTemplateColumns: 'none',
              gap: 'auto',
            }}
          >
            {/* <div className={styles['music-index']}> */}
            {list.map(item => (
              <SetMusicNode
                key={item.gid}
                playingId={playId}
                setPlayingId={setPlayId}
                audioList={audioList}
                bindAddAudio={bindAddAudio}
                bindReplaceAudio={bindReplaceAudio}
                value={{
                  ...item,
                  total_time: item.duration,
                  id: item.gid,
                  preview: item.url,
                }}
              />
            ))}
            {/* </div> */}
          </Mold>
        ))}
      </Skeleton>
    </div>
  );
};

export default MusicLibrary;
