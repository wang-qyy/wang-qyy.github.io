import { PropsWithChildren, HTMLAttributes } from 'react';
import classNames from 'classnames';
import {
  useIconfontStatus,
  useIconpartStatus,
} from '@/store/adapter/useGlobalStatus';
import './index.less';

// const Icon = createFromIconfontCN({
//   scriptUrl: [iconSrc, iconpark],
// });

interface XiuIconProps extends HTMLAttributes<HTMLElement> {
  type: string;
}

export default function XiuIcon(props: PropsWithChildren<XiuIconProps>) {
  const { value: iconfontLoaded } = useIconfontStatus();
  const { value: iconparkLoaded } = useIconpartStatus();

  const { type, className, style, ...others } = props;

  return iconfontLoaded && iconparkLoaded ? (
    <>
      {/* <Icon {...props} /> */}
      <span
        role="img"
        className={classNames('anticon', className)}
        style={style}
        {...others}
      >
        <svg
          width="1em"
          height="1em"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <use xlinkHref={`#${type}`} />
        </svg>
      </span>
    </>
  ) : (
    <div
      className="anticon"
      style={{
        width: '1em',
        height: '1em',
        borderRadius: '50%',
        backgroundColor: '#e3e3e3',
      }}
    />
  );
}
