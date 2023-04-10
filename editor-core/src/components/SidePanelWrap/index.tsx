import {
  CSSProperties,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';

import XiuIcon from '@/components/XiuIcon';

import { useUserInfo } from '@/store/adapter/useUserInfo';

import './index.less';

interface SidePanelWrapProps {
  header?: string | ReactNode;
  headerStyle?: CSSProperties;
  search?: ReactNode;
  onCancel?: () => void;
  bottom?: ReactNode;
  refresh?: boolean;
  wrapClassName?: string; // side-setting-panel:设置面板class
}

/**
 * @params wrapClassName
 * @params refresh
 * @params headerStyle
 * */
const SidePanelWrap = ({
  header,
  search,
  children,
  onCancel,
  bottom,
  headerStyle,
  refresh,
  wrapClassName,
}: PropsWithChildren<SidePanelWrapProps>) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const userInfo = useUserInfo();

  useEffect(() => {
    setRefreshKey(refreshKey + 1);
  }, [userInfo.id]);

  return (
    <div
      className={classNames('side-panel-wrap', wrapClassName)}
      key={refresh ? `sidePanel-${refreshKey}` : 'sidePanel'}
    >
      {header && (
        <div style={headerStyle} className={classNames('side-panel-header')}>
          <div className="side-panel-header-left">
            <XiuIcon
              type="iconshezhi"
              className="side-panel-wrap-setting-icon"
            />
            {header}
          </div>
          {onCancel && (
            <div className="side-panel-close" onClick={onCancel}>
              <XiuIcon type="iconchahao" />
            </div>
          )}
        </div>
      )}
      {search}

      <div className="side-panel-content">{children}</div>

      {bottom && <div className="side-panel-bottom">{bottom}</div>}
    </div>
  );
};

export default SidePanelWrap;
