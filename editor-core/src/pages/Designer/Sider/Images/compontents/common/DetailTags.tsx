import { Radio } from 'antd';
import styles from '../index.less';

const DetailTags = (Props: { bindClickTag: (id: number) => void }) => {
  const { bindClickTag } = Props;

  return (
    <div className={styles.tagWarp}>
      人像：
      <Radio.Group
        name="radiogroup"
        defaultValue={0}
        onChange={e => bindClickTag(e.target.value)}
      >
        <Radio value={0}>全部</Radio>
        <Radio value={1}>有</Radio>
        <Radio value={2}>无</Radio>
      </Radio.Group>
    </div>
  );
};

export default DetailTags;
