import { ChromePicker } from 'react-color';
import { Popover } from 'antd';

import { RGBAToString } from '@/kernel/utils/single';
import styles from './index.less';

const ChromeColorPicker = (props: any) => {
  const { value, changeColor } = props;

  return (
    <div className={styles.fontBgColor}>
      <Popover
        trigger="click"
        placement="bottom"
        getPopupContainer={() =>
          document.getElementById('xiudodo') as HTMLDivElement
        }
        content={
          <ChromePicker
            disableAlpha
            color={value}
            onChange={(color: { rgb: {} }) => {
              changeColor(color.rgb);
            }}
            styles={{
              default: {
                hue: { cursor: 'pointer' },
                picker: { cursor: 'pointer', width: 200 },
              },
            }}
          />
        }
      >
        <div
          className={styles.fontBgItem}
          style={{
            backgroundColor: value && RGBAToString(value),
          }}
        />
      </Popover>
    </div>
  );
};
export default ChromeColorPicker;
