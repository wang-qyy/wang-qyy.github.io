import { PropsWithChildren, useRef } from 'react';
import { Popover, PopoverProps } from 'antd';
import classnames from 'classnames';
import styles from './index.modules.less';

interface PopoverProp extends PopoverProps {
  noPadding?: boolean;
}

export default function OverwritePopover({
  content,
  children,
  ...res
}: PropsWithChildren<PopoverProp>) {
  return (
    <Popover
      overlayClassName={classnames(
        styles['overwrite-popover'],
        styles['no-popover-arrow'],
      )}
      getPopupContainer={ele => ele}
      content={content}
      {...res}
    >
      {children}
    </Popover>
  );
}
