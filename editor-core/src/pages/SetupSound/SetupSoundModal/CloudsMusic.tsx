import { useEffect, useState } from 'react';
import { useMusicStatus } from '@/store/adapter/useMusicStatus';
import { useRequest } from 'ahooks';
import { getMusicClassify, getMusicList } from '@/api/music';

import classNames from 'classnames';
import MusicList from '@/pages/SidePanel/MusicPanel/MusicLis';
import styles from './index.less';

const CloudsMusic = () => {
  const { updateMusicStatus } = useMusicStatus();
  const [selected, setselected] = useState(-1);
  const { data, run } = useRequest(getMusicClassify, { manual: true });

  useEffect(() => {
    run();
  }, []);
  return (
    <div className={styles.MyMusic}>
      <div className={styles.CloudsMusicTopTitle}>
        <span
          className={classNames(styles.CloudsMusicTopTitleItem, {
            [styles.CloudsMusicTopTitleItemactive]: selected === -1,
          })}
          onClick={() => {
            setselected(-1);
          }}
        >
          全部
        </span>
        {data?.msg &&
          Object.keys(data.msg).map(key => {
            const value = data?.msg[key];
            return (
              <div
                key={value.pid}
                className={classNames(styles.CloudsMusicTopTitleItem, {
                  [styles.CloudsMusicTopTitleItemactive]:
                    selected === value.pid,
                })}
                onClick={() => {
                  setselected(value.pid);
                }}
              >
                {value.class_name}
              </div>
            );
          })}
      </div>
      <div className={styles.CloudsMusicTop}>
        <MusicList
          containerClassName={styles.CloudsMusicTopList}
          itemStyle={{ width: '47.5%' }}
          request={getMusicList}
          param={{ keyword: '', class_id: selected }}
        />
      </div>
    </div>
  );
};

export default CloudsMusic;
