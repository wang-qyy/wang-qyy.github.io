import { Tabs } from 'antd';
import classNames from 'classnames';
import { RGBA } from 'wavesurfer.js/src/plugin/spectrogram';
import styles from './index.less';

const { TabPane } = Tabs;

const onChange = (key: string) => {
  console.log(key);
};
export const gradientMock = [
  'linear-gradient(90deg, rgba(34, 84, 244,1) 25.39%, rgba(10, 207, 254,1) 100%)',
  'linear-gradient(90deg, rgba(2, 179, 244,1) 16.53%, rgba(0, 242, 254,1) 100%)',
  'linear-gradient(90deg, rgba(211, 255, 254,1) 0%, rgba(1, 237, 253,1) 100%)',
  'linear-gradient(90deg, rgba(102, 22, 206,1) 0%, rgba(34, 84, 244,1) 100%)',
  'linear-gradient(90deg, rgba(248, 54, 0,1) 0%, rgba(250, 204, 34,1) 100%)',
  'linear-gradient(90deg, rgba(255, 226, 89,1) 0%, rgba(255, 167, 81,1) 100%)',
  'linear-gradient(90deg, rgba(255, 225, 6,1) 0%, rgba(179, 255, 218,1) 100%)',
  'linear-gradient(90deg, rgba(247, 121, 125,1) 0%, rgba(249, 212, 35,1) 95%, rgba(255, 246, 41,1) 100%)',
  'linear-gradient(90deg, rgba(255, 11, 13,1) 0%, rgba(255, 121, 121,1) 100%)',
  'linear-gradient(90deg, rgba(255, 15, 147,1) 0%, rgba(254, 84, 85,1) 82.16%, rgba(245, 68, 68,1) 100%)',
  'linear-gradient(90deg, rgba(252, 92, 125,1) 0%, rgba(255, 251, 213,1) 100%)',
  'linear-gradient(90deg, rgba(255, 15, 147,1) 0%, rgba(196, 113, 237,1) 1%, rgba(246, 79, 89,1) 100%)',
  'linear-gradient(90deg, rgba(17, 153, 142,1) 0%, rgba(56, 239, 125,1) 100%)',
  'linear-gradient(90deg, rgba(171, 255, 203,1) 0%, rgba(0, 226, 104,1) 100%)',
  'linear-gradient(90deg, rgba(97, 255, 156,1) 0%, rgba(95, 175, 250,1) 100%)',
  'linear-gradient(90deg, rgba(140, 244, 190,1) 0%, rgba(250, 255, 209,1) 100%)',
  'linear-gradient(90deg, rgba(44, 241, 253,1) 0%, rgba(154, 192, 129,1) 50%, rgba(249, 149, 22,1) 94%)',
  'linear-gradient(90deg, rgba(48, 34, 238,1) 0%, rgba(143, 20, 128,1) 54%, rgba(236, 7, 19,1) 100%)',
  'linear-gradient(90deg, rgba(18, 214, 223,1) 0%, rgba(134, 113, 239,1) 48%, rgba(247, 15, 255,1) 94%)',
  'linear-gradient(90deg, rgba(30, 150, 0,1) 0%, rgba(255, 242, 0,1) 51%, rgba(243, 41, 53,1) 100%)',
  'linear-gradient(90deg, rgba(217, 255, 255,1) 0%, rgba(255, 232, 180,1) 100%)',
  'linear-gradient(90deg, rgba(217, 255, 255,1) 0%, rgba(255, 232, 179,1) 100%)',

  'linear-gradient(90deg, rgba(255,154,158,1) 0%,  rgba(250,208,196,1) 100%)',
  'linear-gradient(90deg, rgba(161,140,209) 0%,  rgba(251,194,235,1) 100%)',
  'linear-gradient(90deg, rgba(250,208,196,1) 0%,  rgba(255,209,255,1) 100%)',
  'linear-gradient(90deg, rgba(255,154,158,1) 0%,  rgba(254,207,239,1) 100%)',
  'linear-gradient(90deg, rgba(251,194,235,1) 0%,  rgba(166,193,238,1) 100%)',
  'linear-gradient(90deg, rgba(212,252,121,1) 0%,  rgba(150,230,161,1) 100%)',
  'linear-gradient(90deg, rgba(161,196,253,1) 0%,  rgba(194,233,251,1) 100%)',
  'linear-gradient(90deg, rgba(132,250,176,1) 0%,  rgba(143,211,244,1) 100%)',
  'linear-gradient(90deg, rgba(166,192,254,1) 0%,  rgba(246,128,132,1) 100%)',
  'linear-gradient(90deg, rgba(252,203,144,1) 0%,  rgba(213,126,235,1) 100%)',
  'linear-gradient(90deg, rgba(207,217,223,1) 0%,  rgba(226,235,240,1) 100%)',
  'linear-gradient(90deg, rgba(224,195,252,1) 0%,  rgba(142,197,252,1) 100%)',
  'linear-gradient(90deg, rgba(79,172,254,1) 0%,  rgba(0,242,254,1) 100%)',
  'linear-gradient(90deg, rgba(250,112,154,1) 0%,  rgba(254,225,64,1) 100%)',
  'linear-gradient(90deg, rgba(168,237,234,1) 0%,  rgba(254,214,227,1) 100%)',
  'linear-gradient(90deg, rgba(94,231,223,1) 0%,  rgba(180,144,202,1) 100%)',

  'linear-gradient(90deg, rgba(185, 252, 249,1) 0%, rgba(255, 231, 239,1) 100%)',
  'linear-gradient(90deg, rgba(255, 250, 224,1) 0%, rgba(255, 209, 241,1) 100%)',
  'linear-gradient(90deg, rgba(214, 255, 205,1) 0%, rgba(181, 253, 238,1) 100%)',
  'linear-gradient(90deg, rgba(0, 0, 0,1) 26.5%, rgba(255, 255, 255, 0.22) 100%)',
  'linear-gradient(90deg, rgba(0, 0, 0,1) 17.6%, rgba(196, 196, 196, 0) 100%)',
  'linear-gradient(90deg, rgba(190, 190, 190,1) 0%, rgba(0, 0, 0,1) 100%)',
  'linear-gradient(90deg, rgba(48, 67, 82,1) 0%, rgba(215, 210, 204,1) 100%)',
  'linear-gradient(90deg, rgba(203, 166, 77,1) 0%, rgba(237, 205, 91,1) 26.5%, rgba(255, 251, 187,1) 50%, rgba(237, 205, 91,1) 72.3%, rgba(206, 171, 74,1) 100%)',
  'linear-gradient(90deg, rgba(185, 147, 13,1) 0%, rgba(254, 246, 149,1) 50%, rgba(183, 144, 9,1) 100%)',
  'linear-gradient(90deg, rgba(168, 182, 196,1) 0%, rgba(250, 246, 242,1) 53.5%, rgba(168, 182, 196,1) 100%)',
  'linear-gradient(90deg, rgba(104, 116, 125,1) 0%, rgba(240, 240, 240,1) 53.5%, rgba(104, 116, 125,1) 100%)',
];
const ColorSelector = (props: {
  monochrome: Array;
  value: any;
  updateColor: (val: RGBA) => void;
  changeMockGradient: (val: string) => void;
}) => {
  const { monochrome, value, updateColor, changeMockGradient } = props;
  const defaultActiveKey =
    typeof value === 'object' &&
      value[Object.keys(value)[0]]?.color?.type === 'linear'
      ? '2'
      : '1';

  return (
    <div className={styles.svgColorSelector}>
      <Tabs defaultActiveKey={defaultActiveKey} onChange={onChange}>
        <TabPane tab="预设纯色" key="1">
          <div
            className={classNames({
              'grid-box': true,
              'gap-10': true,
              'grid-columns-7': true,
            })}
            style={{ flex: 1, padding: '1px' }}
          >
            {monochrome.map(item => (
              <div
                className="gap-item box-border"
                style={{ background: item }}
                key={item}
                onClick={e => {
                  const rgb = item.replace(/[^\d,]/g, '').split(',');
                  const tempColor = {
                    r: Number(rgb[0]),
                    g: Number(rgb[1]),
                    b: Number(rgb[2]),
                    a: 1,
                  };
                  updateColor(tempColor);
                }}
              />
            ))}
          </div>
        </TabPane>
        <TabPane tab="预设渐变" key="2">
          <div
            className={classNames({
              'grid-box': true,
              'gap-10': true,
              'grid-columns-7': true,
            })}
            style={{ flex: 1, padding: '1px' }}
          >
            {gradientMock.map(item => (
              <div
                key={item}
                style={{ backgroundImage: item }}
                onClick={e => {
                  e.stopPropagation();
                  changeMockGradient(item);
                }}
                className="gap-item box-border"
              />
            ))}
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ColorSelector;
