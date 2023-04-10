import { CSSProperties, PropsWithChildren } from 'react';
import classNames from 'classnames';

export default function Skeleton({
  className,
  style,
}: PropsWithChildren<{ className?: string; style?: CSSProperties }>) {
  return (
    <div className={classNames('xiudd-skeleton', className)} style={style} />
  );
}
