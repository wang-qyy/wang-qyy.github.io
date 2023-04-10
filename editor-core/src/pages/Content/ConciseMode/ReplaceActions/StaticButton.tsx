import { XiuIcon } from '@/components';
import { ReactNode } from 'react';

import styles from './index.modules.less';

interface IProps {
  onClick?: () => void;
  iconType?: string;
  text?: ReactNode;
}

const StaticButton = (props: IProps) => {
  const { onClick = () => {}, iconType, text } = props;

  const handleClick = () => {
    onClick();
  };

  return (
    <div onClick={handleClick} className={styles.item}>
      {iconType && (
        <>
          <XiuIcon type={iconType} style={{ fontSize: 14 }} />{' '}
        </>
      )}
      {text}
    </div>
  );
};

StaticButton.defaultProps = {
  iconType: undefined,
  text: undefined,
  onClick: () => {},
};

export default StaticButton;
