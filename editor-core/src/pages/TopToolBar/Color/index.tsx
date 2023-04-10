import { Tooltip } from 'antd';
import {
  useSetTemplateBackgroundColorByObserver,
  useCurrentTemplate,
  toJS,
  pauseVideo,
  observer,
  RGBA,
} from '@hc/editor-core';
import OverwritePopover from '@/components/OverwritePopover';
import { CSSProperties, PropsWithChildren, useState } from 'react';
import { XiuIcon } from '@/components';
import classNames from 'classnames';
import { clickActionWeblog } from '@/utils/webLog';
import styles from './index.less';
import Circle from './Circle';

const blankColor = [
  {
    rgba: { r: 0, g: 0, b: 0, a: 1 },
    color: '#000000',
    border: '1px solid  #AEAEAE',
  },
  {
    rgba: { r: 255, g: 255, b: 255, a: 1 },
    color: '#ffffff',
    border: '1px solid #E0E0E0',
  },
  {
    rgba: { r: 47, g: 183, b: 158, a: 1 },
    color: '#2FB79E',
    border: '1px solid #239E87',
  },
  {
    rgba: { r: 127, g: 102, b: 227, a: 1 },
    color: '#7F66E3',
    border: '1px solid #7959DA',
  },
  {
    rgba: { r: 36, g: 153, b: 247, a: 1 },
    color: '#2499F7',
    border: '1px solid #1F8EE6',
  },
  {
    rgba: { r: 252, g: 189, b: 20, a: 1 },
    color: '#FCBD14',
    border: '1px solid #EBAE12',
  },
];

interface ColorProps {
  className?: string;
  style?: CSSProperties;
}

export function ColorOptions() {
  const { update } = useSetTemplateBackgroundColorByObserver();

  const changedColor = (color: RGBA) => {
    clickActionWeblog('tool_template_background_color');

    pauseVideo();
    update(color);
  };
  return <Circle changedColor={changedColor} />;
}

const Color = (props: PropsWithChildren<ColorProps>) => {
  const { className, ...others } = props;

  const { backgroundColor, update } = useSetTemplateBackgroundColorByObserver();
  const { template } = useCurrentTemplate();

  const changedColor = (color: RGBA) => {
    clickActionWeblog('tool_template_background_color');

    pauseVideo();
    update(color);
  };

  return (
    <>
      {template?.assets.length === 0 &&
        blankColor.map((item, index) => {
          return (
            <div
              key={index}
              className={classNames(className)}
              onClick={e => {
                e.stopPropagation();
              }}
              {...others}
            >
              <div
                className={styles.colorItem}
                onClick={e => {
                  e.stopPropagation();
                  changedColor(item.rgba);
                }}
                style={{ background: item.color, border: item.border }}
              />
            </div>
          );
        })}

      <Tooltip title="背景颜色">
        <div className={classNames(styles.colorPro, className)} {...others}>
          <XiuIcon type="beijingtianchong" style={{ fontSize: 20 }} />
          {backgroundColor?.type === 'linear' ? (
            <XiuIcon type="jianbian" className={styles.choosedColorBottom} />
          ) : (
            <div
              style={{
                backgroundColor: `rgba(${backgroundColor?.r}, ${backgroundColor?.g}, ${backgroundColor?.b}, ${backgroundColor?.a})`,
              }}
              className={styles.choosedColor}
            />
          )}
        </div>
      </Tooltip>
    </>
  );
};
export default observer(Color);
