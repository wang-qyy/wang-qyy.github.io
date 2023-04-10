import styles from './index.less';
import SimpleShow from './common/SimpleShow';

const InitialPage = (Props: {
  bindClickMore: (title: string) => void;
  creativeBg: Array<object>;
  illustration: Array<object>;
  pic: Array<object>;
}) => {
  const { bindClickMore, creativeBg, illustration, pic } = Props;

  return (
    <div className={styles.initialPageWarp}>
      <SimpleShow
        title="创意背景"
        bindClickMore={bindClickMore}
        data={creativeBg}
      />

      <SimpleShow
        title="插画"
        bindClickMore={bindClickMore}
        data={illustration}
      />
      <SimpleShow title="照片" bindClickMore={bindClickMore} data={pic} />
    </div>
  );
};

export default InitialPage;
