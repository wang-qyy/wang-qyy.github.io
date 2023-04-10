import { PropsWithChildren, ReactNode, HTMLAttributes } from 'react';
import classNames from 'classnames';
import './index.less';

interface TagProps extends HTMLAttributes<HTMLDivElement> {
  label: string | ReactNode;
  active?: boolean;
}
export default function Tag(props: PropsWithChildren<TagProps>) {
  const { label, active, ...others } = props;

  return (
    <div
      className={classNames('xiudd-designer-tag', {
        'xiudd-designer-tag-active': active,
      })}
      {...others}
    >
      {label}
    </div>
  );
}
