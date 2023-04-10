import { CSSProperties, MouseEvent, PropsWithChildren } from 'react';
import { Tooltip } from 'antd';
import classNames from 'classnames';

import XiuIcon from '@/components/XiuIcon';
import { useDebounceFn } from 'ahooks';

interface ActionElementProps {
  tip: string;
  icon?: string;
  onClick: (e: MouseEvent<HTMLElement>) => void;
  hidden?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
}

export function ElementAction(props: PropsWithChildren<ActionElementProps>) {
  const { tip, icon, children, className, onClick, ...others } = props;

  return (
    <Tooltip
      title={tip}
      arrowPointAtCenter
      getPopupContainer={() =>
        document.getElementById('xiudodo') as HTMLElement
      }
      overlayClassName="asset-action"
    >
      <div
        {...others}
        className={classNames('element-action', className)}
        onClick={onClick}
      >
        {icon ? <XiuIcon type={icon} /> : children}
      </div>
    </Tooltip>
  );
}
