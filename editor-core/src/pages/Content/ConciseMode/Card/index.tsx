import classNames from 'classnames';
import { observer } from 'mobx-react';
import React, { ReactNode } from 'react';

import styles from './index.less';

interface IProps {
  active: boolean;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  hiddenContent: ReactNode;
  showContent: ReactNode;
}

const Card: React.FC<IProps> = props => {
  const {
    active,
    style,
    onClick = () => {},
    onMouseDown = () => {},
    children,
    hiddenContent,
    showContent,
  } = props;
  return (
    <div
      className={classNames(styles.Card, {
        [styles.active]: active,
      })}
      style={style}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      {children}
      <div className={styles.hidden}>{hiddenContent}</div>
      <div className={styles.show}>{showContent}</div>
    </div>
  );
};

Card.defaultProps = {
  style: undefined,
  onClick: () => {},
};

export default observer(Card);
