import { CSSProperties, PropsWithChildren } from 'react';
import classNames from 'classnames';
import LogoImage from './LogoImage';

import './index.less';

interface XiudodoLoadingProps {
  loading: boolean;
  style?: CSSProperties;
  className?: string;
}

export default function XiudodoLoading(
  props: PropsWithChildren<XiudodoLoadingProps>,
) {
  const { loading, className, ...others } = props;

  return (
    <div
      hidden={!loading}
      className={classNames('xiudodd-loading-wrap', className)}
      {...others}
    >
      <div className="xiudodd-loading">
        <div className="enterLoading-load">
          <svg className="enterLoading-load-item" viewBox="25 25 50 50">
            <circle
              className="enterLoading-loading"
              cx="50"
              cy="50"
              r="20"
              fill="null"
            />
          </svg>
        </div>
        <LogoImage />

        <div className="xiudodd-loading-tip">正在加载，请稍等…</div>
      </div>
    </div>
  );
}
