import {
  PropsWithChildren,
  useState,
  useEffect,
  memo,
  CSSProperties,
} from 'react';
import { rShow } from '@/utils/single';
import QueueAnim from 'rc-queue-anim';
import classNames from 'classnames';

function LazyLoadComponent({
  visible,
  children,
  keyName,
  className,
}: PropsWithChildren<{
  visible: boolean;
  keyName?: string;
  className?: string;
}>) {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    if (visible && !isLoaded) {
      setTimeout(() => {
        setIsLoaded(true);
      });
    }
  }, [visible]);

  return (
    <div
      style={{ height: '100%', ...rShow(visible) }}
      className={classNames('xiudodo-lazyLoad', className)}
    >
      {/* {isLoaded && children} */}
      {isLoaded && (
        <QueueAnim
          forcedReplay={visible}
          type="left"
          delay={300}
          style={{ height: '100%' }}
        >
          <div
            className="xiudodo-lazyload-content"
            key={`queueAnim-${keyName}`}
            style={{ height: '100%' }}
          >
            {children}
          </div>
        </QueueAnim>
      )}
    </div>
  );
}

export default memo(LazyLoadComponent);
