import { PropsWithChildren, ReactNode, MouseEvent } from 'react';
import classNames from 'classnames';
import DragBox from '@/components/DragBox';
import {
  getInitFontAttribute,
  TextType,
} from '@/utils/assetHandler/assetUtils';

import styles from './index.modules.less';

interface TextItemProps {
  style?: any;
  src?: string;
  active?: Boolean;
  name?: ReactNode;
  onClick: (e: MouseEvent<HTMLElement>) => void;
  type: TextType;
  actionType?: 'add' | 'update'; // 点击时间类型
  attribute: {
    effect?: string;
    rt_preview_url?: string;
    effectColorful?: {
      resId: string;
      effect: string;
    };
  };
}
export default function TextItem(props: PropsWithChildren<TextItemProps>) {
  const {
    type,
    style,
    src,
    name,
    active = false,
    onClick,
    attribute,
    actionType = 'add',
  } = props;

  return (
    <DragBox
      canDrag={actionType === 'add'}
      style={style}
      className={classNames(styles.item, {
        [styles['item-active']]: active,
      })}
      type="text"
      data={{
        meta: { type: 'text', addOrigin: 'specificWord' },
        attribute: {
          ...attribute,
          ...getInitFontAttribute(type),
        },
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={onClick}
      >
        {name || <img src={src} alt="text-effect" width="100%" />}
      </div>
    </DragBox>
  );
}
