import { XiuIcon } from '@/components';
import { ReactNode } from 'react';

import commonStyles from './common.modules.less';

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
    <div onClick={handleClick} className={commonStyles.item}>
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
