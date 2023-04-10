import { PropsWithChildren } from 'react';
import style from './index.module.less';

const SiderPanel = ({ children }: PropsWithChildren<any>) => {
  return <div className={style.siderPanel}>{children}</div>;
};
export default SiderPanel;
