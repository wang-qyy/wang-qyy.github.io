import { CSSProperties, PropsWithChildren } from 'react';
import { Row, Col } from 'antd';
import classNames from 'classnames';

import Skeleton from './Skeleton';

import './index.less';

export { Skeleton };

export interface XiuddSkeletonProps {
  rows?: number;
  columns?: number;
  title?: boolean;
  more?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function XiuddSkeletonModule(
  props: PropsWithChildren<{ loading: boolean } & XiuddSkeletonProps>,
) {
  const {
    title,
    more,
    loading,
    children,
    columns = 2,
    rows = 1,
    className,
    ...others
  } = props;

  return (
    <div className={classNames('xiudd-skeleton-wrap', className)} {...others}>
      {loading ? (
        <Row gutter={[0, 16]}>
          {[...new Array(rows)].map((row, rowIndex) => (
            <Col key={`XiuddSkeleton-row-${rowIndex}`} span="24">
              <Row justify="space-between" gutter={[16, 16]}>
                <Col span="18">
                  {title && <Skeleton className="xiudd-skeleton-title" />}
                </Col>
                <Col span="4">
                  {more && <Skeleton className="xiudd-skeleton-more" />}
                </Col>

                {[...new Array(columns)].map((column, columnIndex) => (
                  <Col
                    span={24 / columns}
                    key={`xiudd-skeleton-column-${columnIndex}`}
                  >
                    <Skeleton className="xiudd-skeleton-block" />
                  </Col>
                ))}
              </Row>
            </Col>
          ))}
        </Row>
      ) : (
        children
      )}
    </div>
  );
}
