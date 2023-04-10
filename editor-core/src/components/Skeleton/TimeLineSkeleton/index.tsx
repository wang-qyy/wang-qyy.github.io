import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import Skeleton from '../Skeleton';
import './index.less';

export default function TimeLineSkeleton({
  loading,
  children,
  className,
}: PropsWithChildren<{ loading: boolean; className?: string }>) {
  return (
    <div className={classNames(className)}>
      {loading ? (
        <div className="time-line-skeleton">
          <div className="time-line-skeleton-part-list">
            <Skeleton className="time-line-skeleton-part" style={{ flex: 3 }} />
            <Skeleton className="time-line-skeleton-part" style={{ flex: 2 }} />
            <Skeleton className="time-line-skeleton-part" style={{ flex: 3 }} />
            <Skeleton className="time-line-skeleton-part" style={{ flex: 4 }} />
          </div>
          <Skeleton className="time-line-skeleton-audio" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
