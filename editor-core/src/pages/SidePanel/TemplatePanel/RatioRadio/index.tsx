import { Radio } from 'antd';
import styles from './index.less';

function index(props: { active: number; onChange: (active: any) => void }) {
  const { active, onChange } = props;

  return (
    <div className={styles.ratioRadio}>
      <div className={styles.ratioRadioLeft}>比例：</div>

      {[
        { name: '横板', shape: 'w', key: 1 },
        { name: '竖板', shape: 'h', key: 2 },
        { name: '方形', shape: 'c', key: 0 },
      ].map(element => {
        return (
          <Radio
            onClick={() => onChange(element)}
            key={`shape-${element.shape}`}
            value={element.shape}
            checked={active === element.key}
          >
            {element.name}
          </Radio>
        );
      })}
    </div>
  );
}

export default index;
