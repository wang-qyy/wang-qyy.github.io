import { Divider, Switch } from 'antd';
import { useTextBackgroundByObserver, observer } from '@hc/editor-core';
import { SketchPicker } from 'react-color';
import OverwritePopover from '@/components/OverwritePopover';
import { RGBAToString } from '@/kernel/utils/single';
import styles from './index.less';
import SliderText from '../SliderText/index';

function index(props: any) {
  const { BasicItem } = props;
  const {
    textBackground,
    open,
    close,
    changeColor,
    changeOpacity,
    changeBorderRadius,
  } = useTextBackgroundByObserver();

  const color = textBackground?.color && RGBAToString(textBackground?.color);

  const onChangeStatus = (checked: boolean) => {
    if (checked) {
      open();
    } else {
      close();
    }
  };
  return (
    <div>
      <Divider style={{ background: '#353540' }} />
      {[
        {
          name: '字体背景',
          key: 'letterSpacing',
          isShow: true,
          component: (
            <Switch
              checked={textBackground?.enabled}
              onChange={onChangeStatus}
            />
          ),
        },
        {
          name: '背景颜色',
          key: 'color',
          isShow: true,
          component: (
            <OverwritePopover
              placement="top"
              trigger="click"
              className={styles.color}
              overlayInnerStyle={{
                marginTop: 30,
                marginLeft: 10,
                position: 'fixed',
              }}
              content={
                <SketchPicker
                  width={270}
                  color={textBackground?.color}
                  onChange={(color: { rgb: {} }) => {
                    changeColor(color.rgb);
                  }}
                />
              }
            >
              <div
                className={styles.chooseColor}
                style={{ background: color }}
              />
            </OverwritePopover>
          ),
        },

        {
          name: '背景不透明度',
          key: 'opacity',
          isShow: true,
          component: (
            <SliderText
              step={1}
              min={0}
              max={100}
              onChange={(val: number) => {
                changeOpacity(val);
              }}
              defaultValue={textBackground?.opacity ?? 50}
              value={textBackground?.opacity ?? 50}
            />
          ),
        },
        {
          name: '圆角',
          key: 'lineHeight',
          isShow: true,
          component: (
            <SliderText
              min={0}
              max={50}
              defaultValue={textBackground?.borderRadius || 0}
              value={textBackground?.borderRadius || 0}
              onChange={val => {
                changeBorderRadius(val);
              }}
            />
          ),
        },
      ].map(item => {
        if (item.key === 'letterSpacing') {
          return <BasicItem {...item} key={item.key} />;
        }
        if (textBackground?.enabled) {
          return <BasicItem {...item} key={item.key} />;
        }
      })}
    </div>
  );
}

export default observer(index);
