import React, { CSSProperties, PropsWithChildren } from 'react';
import { Tooltip } from 'antd';
import { XiuIcon } from '@/components';

import {
  useFontColorByObserver,
  useGetCurrentAsset,
  toJS,
} from '@hc/editor-core';
import classNames from 'classnames';
import { RGBAToString } from '@/kernel/utils/single';
import styles from './index.less';

interface ColorProps {
  className?: string;
  style?: CSSProperties;
}

function FontColor(props: PropsWithChildren<ColorProps>) {
  const { className, ...others } = props;
  const [fontColor] = useFontColorByObserver();
  const editAsset = useGetCurrentAsset();
  const { attribute } = editAsset;
  const { effectColorful, effectVariant } = attribute;
  const isSpecific = effectColorful || effectVariant;

  return (
    <div className={classNames(styles.fontColor, className)} {...others}>
      <Tooltip title="文字颜色">
        <div className={styles.colorIcon}>
          <XiuIcon type="zitiyanse" />
        </div>

        {fontColor && !isSpecific && (
          <div
            style={{
              backgroundColor: fontColor && RGBAToString(fontColor),
            }}
            className={styles.choosedColor}
          />
        )}
      </Tooltip>
    </div>
  );
}

export default FontColor;
