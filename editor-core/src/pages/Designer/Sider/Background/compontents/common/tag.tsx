import { useSetState } from 'ahooks';
import classNames from 'classnames';
import styles from '../index.less';

interface State {
  isShow: boolean;
  class_id: number;
}

const Tag = (Props: {
  title: string;
  bindClickTag: (id: string | number) => void;
  data?: any;
}) => {
  const { title, bindClickTag, data } = Props;
  const [state, setState] = useSetState<State>({
    isShow: false,
    class_id: -1,
  });

  // 标签数据
  const tagArr = data || [
    { id: 1, name: '横' },
    { id: 2, name: '竖' },
    { id: 0, name: '方' },
  ];

  // 展示标签
  const showTagArr =
    !state.isShow && tagArr.length > 6 ? tagArr.slice(0, 5) : tagArr;

  return (
    <div className={styles.detailPageTitle}>
      <div className={classNames(styles.itemName)}>{title}</div>
      <div
        className={classNames(
          { [styles.active]: state.class_id === -1 },
          styles.item,
        )}
        onClick={() => {
          setState({
            class_id: -1,
          });
          bindClickTag('');
        }}
      >
        全部
      </div>
      {showTagArr.map((item: any, index: number) => {
        return (
          <div
            className={classNames(
              { [styles.active]: item.id === state.class_id },
              styles.item,
            )}
            onClick={() => {
              setState({
                class_id: item.id,
              });
              bindClickTag(item.id);
            }}
            key={item.id}
          >
            <div className={styles.itemText}>{item.name}</div>
          </div>
        );
      })}
      {tagArr.length > 6 && (
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

export default Tag;
