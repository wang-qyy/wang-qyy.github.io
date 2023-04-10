import { Tooltip } from 'antd';
import { observer, useTextBackgroundByObserver } from '@hc/editor-core';
import { CSSProperties, PropsWithChildren } from 'react';
import { XiuIcon } from '@/components';
import classNames from 'classnames';
import { RGBAToStringByOpacity } from '@/kernel/utils/single';
import styles from './index.less';

interface ColorProps {
  className?: string;
  style?: CSSProperties;
}

const FontBackground = (props: PropsWithChildren<ColorProps>) => {
  const { className, ...others } = props;
  const { textBackground } = useTextBackgroundByObserver();
  return (
    <div className={classNames(styles.fontBackground, className)} {...others}>
      <Tooltip title="文字底色">
        <div className={styles.colorPro}>
          <XiuIcon type="beijingtianchong" />
        </div>

        {textBackground?.enabled ? (
          <div className={styles.colorProRow}>
            <div
              style={{
                backgroundColor:
                  textBackground?.color &&
                  RGBAToStringByOpacity(
                    textBackground?.color,
                    textBackground?.opacity,
                  ),
              }}
              className={styles.choosedColor}
            />
          </div>
        ) : (
          <div className={styles.icon} />
        )}
      </Tooltip>
    </div>
  );
};
export default observer(FontBackground);
