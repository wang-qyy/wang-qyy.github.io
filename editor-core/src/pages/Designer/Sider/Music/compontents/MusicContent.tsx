import InfiniteLoader, {
  InfiniteLoaderProps,
} from '@/components/InfiniteLoader';
import XiuIcon from '@/components/XiuIcon';
import styles from './index.less';

interface MusicListProps extends Partial<InfiniteLoaderProps> {
  param: { keyword?: string };
  Item: (props: { item: any }) => JSX.Element;
}

const MusicList = (Props: MusicListProps) => {
  const { param, request, Item, ...others } = Props;

  return (
    <InfiniteLoader
      request={request}
      params={param}
      emptyDesc={
        <div className={styles.emptyWarp}>
          <XiuIcon type="iconkong" className={styles.img} />
          {`未搜索到${param?.keyword ? `与“${param?.keyword}”` : ''}相关音乐`}
        </div>
      }
      wrapStyle={{ flex: 1, height: 0, marginBottom: 16 }}
      skeleton={{
        className: styles.musicContentWarp,
        style: { gridTemplateColumns: `repeat(auto-fill,minmax(218px,1fr))` },
      }}
      {...others}
    >
      {({ list }) => {
        return (
          <>
            {list.map(item => (
              <Item item={item} key={item.id} />
            ))}
          </>
        );
      }}
    </InfiniteLoader>
  );
};

export default MusicList;
