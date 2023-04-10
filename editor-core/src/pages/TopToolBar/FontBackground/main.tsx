import { Switch } from 'antd';
import { useThrottleFn } from 'ahooks';

import {
  useTextBackgroundByObserver,
  observer,
  setHideTransformerBoxStatus,
} from '@hc/editor-core';

import ChromeColorPicker from '@/components/ChromeColorPicker';
import { clickActionWeblog } from '@/utils/webLog';

import FontSlider from './FontSlider';
import styles from './index.less';

const FontBackgroundMain = (props: any) => {
  const {
    textBackground,
    open,
    close,
    changeColor,
    changeOpacity,
    changeBorderRadius,
  } = useTextBackgroundByObserver();
  const { run: onChange } = useThrottleFn(
    color => {
      props?.changedColor(color);
    },
    { wait: 200 },
  );
  const onChangeStatus = (checked: boolean) => {
    if (checked) {
      open();
    } else {
      close();
    }
  };
  return (
    <div className={styles.fontBg}>
      <div className={styles.fontBgRow}>
        <div className={styles.fontBgRowName}>字体背景色</div>
        <Switch checked={textBackground?.enabled} onChange={onChangeStatus} />
      </div>
      <div className={!textBackground?.enabled ? styles.disabled : ''}>
        <div className={styles.fontBgRow}>
          <div className={styles.fontBgRowName}>颜色</div>
          <ChromeColorPicker
            value={textBackground?.color}
            changeColor={(color: any) => {
              clickActionWeblog('tool_text_backgtound_color');
              changeColor(color);
            }}
          />
        </div>
        <FontSlider
          title="不透明度"
          step={1}
          formatter={(value: number) => `${parseInt(value)}%`}
          min={0}
          max={100}
          onChange={(val: number) => {
            changeOpacity(val);
          }}
          onAfterChange={() => {
            clickActionWeblog('tool_text_backgtound_color_opacity');
          }}
          value={textBackground?.opacity ?? 50}
        />
        <FontSlider
          title="圆角"
          min={0}
          max={50}
          onChange={(val: number) => {
            setHideTransformerBoxStatus(true);
            changeBorderRadius(val);
          }}
          value={textBackground?.borderRadius || 0}
          onAfterChange={() => {
            clickActionWeblog('tool_text_backgtound_radius');
            setHideTransformerBoxStatus(false);
          }}
          tooltipVisible={false}
        />
      </div>
    </div>
  );
};
export default observer(FontBackgroundMain);
