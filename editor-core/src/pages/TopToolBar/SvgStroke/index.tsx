import { Tooltip } from 'antd';
import { observer, useSVGStrokesByObserver } from '@hc/editor-core';
import OverwritePopover from '@/components/OverwritePopover';
import { CSSProperties, PropsWithChildren } from 'react';
import { XiuIcon } from '@/components';
import classNames from 'classnames';
import { RGBAToString, RGBAToStringByOpacity } from '@/kernel/utils/single';
import styles from './index.less';
import Circle from './SvgStrokeMain';

interface ColorProps {
  className?: string;
  style?: CSSProperties;
}

const SvgStroke = (props: PropsWithChildren<ColorProps>) => {
  const { className = '', ...others } = props;
  const { svgStroke } = useSVGStrokesByObserver();

  if (!svgStroke) {
    return null;
  }
  return (
    <OverwritePopover
      placement="bottomLeft"
      trigger="click"
      content={<Circle />}
    >
      <div className={classNames(styles.fontBackgroundWrap, className)}>
        <div className={classNames(styles.fontBackground, className)}>
          <div className={styles.colorPro}>
            <XiuIcon type="biankuangyanse" />
          </div>
          <div className={styles.colorProRow}>
            <div
              style={{
                backgroundColor: RGBAToString(svgStroke?.stroke),
              }}
              className={styles.choosedColor}
            />
          </div>
        </div>
      </div>
    </OverwritePopover>
  );
};
export default observer(SvgStroke);
