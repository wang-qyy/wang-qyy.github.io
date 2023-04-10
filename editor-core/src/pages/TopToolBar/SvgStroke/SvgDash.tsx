import { Select } from 'antd';
import { ossEditorPath } from '@/config/urls';
import styles from './index.less';

const SvgDash = (props: {
  value: number;
  title: string;
  onChange: (val: number) => void;
}) => {
  const { title, value, onChange } = props;
  const strokePic = [
    ossEditorPath('/svg/svgStrokes/dash0-0.svg'),
    ossEditorPath('/svg/svgStrokes/dash0-1.svg'),
    ossEditorPath('/svg/svgStrokes/dash0-2.svg'),
    ossEditorPath('/svg/svgStrokes/dash1-1.svg'),
    ossEditorPath('/svg/svgStrokes/dash1-2.svg'),
    ossEditorPath('/svg/svgStrokes/dash2-1.svg'),
    ossEditorPath('/svg/svgStrokes/dash2-2.svg'),
  ];
  return (
    <>
      <div className={styles.fontBgRow}>
        <div className={styles.fontBgRowName}>{title}</div>
        <Select
          placeholder="选择边框样式"
          value={value === -1 ? undefined : value}
          onChange={val => {
            onChange(val);
          }}
        >
          {strokePic.map((item: string, index: number) => (
            <Select.Option key={item} value={index}>
              <img src={item} alt="" style={{ width: 108 }} />
            </Select.Option>
          ))}
        </Select>
      </div>
    </>
  );
};
export default SvgDash;
