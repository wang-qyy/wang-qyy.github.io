import { Select } from 'antd';
import { ossEditorPath } from '@/config/urls';
import { useSVGStrokesByObserver, observer } from '@hc/editor-core';
import styles from '../index.modules.less';

const OutlineStyle = () => {
  const { changeDashStyle, svgStroke } = useSVGStrokesByObserver();
  const strokePic = [
    ossEditorPath('/svg/svgStrokes/2.svg'),
    ossEditorPath('/svg/svgStrokes/3.svg'),
    ossEditorPath('/svg/svgStrokes/4.svg'),
    ossEditorPath('/svg/svgStrokes/6.svg'),
    ossEditorPath('/svg/svgStrokes/5.svg'),
    ossEditorPath('/svg/svgStrokes/7.svg'),
    ossEditorPath('/svg/svgStrokes/1.svg'),
  ];
  return (
    <div className={styles.basicRow}>
      <div className={styles.basicRowName}>描边样式</div>
      <Select
        placeholder="选择边框样式"
        value={svgStroke?.strokeDashType}
        onChange={val => {
          console.log('val', val);

          changeDashStyle(val);
        }}
        dropdownClassName="outlineStyleSelect"
        dropdownStyle={{ background: '#1C1C26' }}
      >
        {strokePic.map((item: string, index: number) => (
          <Select.Option key={item} value={index}>
            <img
              src={item}
              alt=""
              style={{
                width: '100%',
              }}
            />
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};
export default observer(OutlineStyle);
