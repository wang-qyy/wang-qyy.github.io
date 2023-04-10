import { CSSProperties, PropsWithChildren, ReactNode } from 'react';
import './index.less';

interface MoldProps {
  title: string | ReactNode;
  hasMore?: boolean;
  extraContent?: ReactNode | string;
  style?: CSSProperties;
  contentStyle?: CSSProperties;
}

/**
 *
 * @param contentStyle 列表样式
 * */
export default function Mold(props: PropsWithChildren<MoldProps>) {
  const { title, extraContent, children, style, contentStyle } = props;

  return (
    <>
      <div className="mold-header" style={style}>
        <div>{title}</div>
        <div className="mold-extra">{extraContent}</div>
      </div>
      <div className="mold-list" style={contentStyle}>
        {children}
      </div>
    </>
  );
}
