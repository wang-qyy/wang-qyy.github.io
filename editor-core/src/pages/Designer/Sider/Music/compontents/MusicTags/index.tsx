import { useEffect, useRef, memo } from 'react';
import { useSetState } from 'ahooks';
import classNames from 'classnames';
import { getMusicLabel } from '@/api/music';

import styles from './index.modules.less';

interface State {
  isShow: boolean;
  tagArr: Array<object>;
}

const MusicTags = (Props: {
  bindClickTag: (id: string) => void;
  class_id?: string;
}) => {
  const { bindClickTag, class_id } = Props;
  const [state, setState] = useSetState<State>({
    isShow: false,
    tagArr: [],
  });

  const { tagArr } = state;

  useEffect(() => {
    getMusicLabel().then(res => {
      if (res.code === 0) {
        setState({
          tagArr: res.data,
        });
      }
    });
  }, []);

  // 展示标签
  const showTagArr =
    !state.isShow && tagArr.length > 7 ? tagArr.slice(0, 6) : tagArr;

  return (
    <div className={styles.musicTags}>
      <div
        className={classNames(
          { [styles.active]: class_id === '' },
          styles.item,
        )}
        onClick={() => {
          bindClickTag('');
        }}
      >
        全部
      </div>
      {showTagArr.map((item: any, index: number) => {
        return (
          <div
            className={classNames(styles.item, {
              [styles.active]: item.pid === class_id,
            })}
            onClick={() => {
              bindClickTag(item.pid);
            }}
            key={item.pid}
          >
            <div className={styles.itemText}>{item.class_name}</div>
          </div>
        );
      })}
      {tagArr.length > 7 && (
        <div
          className={styles.item}
          onClick={() => {
            setState({
              isShow: !state.isShow,
            });
          }}
        >
          {state.isShow ? '收起' : '查看全部'}
        </div>
      )}
    </div>
  );
};

export default memo(MusicTags);
