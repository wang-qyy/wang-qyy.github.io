import { HTMLAttributes, useRef } from 'react';
import classNames from 'classnames';
import AutoDestroyVideo from '@/components/AutoDestroyVideo';

import '../index.less';

interface TransitionItemProps extends HTMLAttributes<HTMLDivElement> {
  transition: {
    poster: string;
    src: string;
    name?: string;
  };
  active: boolean;
  // eslint-disable-next-line react/require-default-props
  actionDom?: any;
}
function TransitionItem({
  transition,
  onClick,
  active,
  actionDom,
}: TransitionItemProps) {
  const itemRef = useRef(null);
  return (
    <div
      className={classNames('designer-transition-item', {
        'designer-transition-item-active': active,
      })}
      ref={itemRef}
    >
      <div
        style={{ width: '100%', height: 98, position: 'relative' }}
        onClick={onClick}
      >
        <AutoDestroyVideo poster={transition.poster} src={transition.src} />
      </div>
      {transition.name && (
        <div className="designer-transition-title">{transition.name}</div>
      )}
      {active && actionDom && actionDom({ itemRef })}
    </div>
  );
}
export default TransitionItem;
