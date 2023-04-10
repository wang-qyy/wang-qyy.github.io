import {
  ColorResult,
  CustomPicker,
  InjectedColorProps,
  TwitterPicker,
} from 'react-color';
// TODO: 类型文件中没有导出 ColorWrap，但实际源码是有导出的,作用是格式化入参color和onchange事件的参数
// @ts-ignore
import { Saturation, Hue, ColorWrap } from 'react-color/lib/components/common';

import styles from './index.modules.less';

interface IProps {
  color?: string;
  onChange: (color: ColorResult) => void;
}

const SaturationWrap = ColorWrap(Saturation);
const HueWrap = ColorWrap(Hue);

const CustomColor = (props: InjectedColorProps & IProps) => {
  const { color, onChange } = props;
  // const [color, _color] = useState('#f00');

  const handleCHange = (res: ColorResult) => {
    onChange(res);
  };

  return (
    <div className={styles.CustomColor}>
      <div className={styles.Saturation}>
        <SaturationWrap {...props} color={color} onChange={handleCHange} />
      </div>
      <div className={styles.handler}>
        <div className={styles.Hue}>
          <HueWrap {...props} color={color} onChange={handleCHange} />
        </div>
        <div className={styles.TwitterPicker}>
          <TwitterPicker
            onChange={handleCHange}
            color={color}
            styles={{
              default: {
                triangle: { display: 'none' },
                swatch: { width: 22, height: 22 },
                input: { height: 22, width: 81 },
                label: { height: 22 },
                body: { padding: '12px 0' },
                card: { boxShadow: 'none' },
                hash: { width: 22, height: 22 },
              },
            }}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};

CustomColor.defaultProps = {
  color: undefined,
};

export default CustomPicker<IProps>(CustomColor);
