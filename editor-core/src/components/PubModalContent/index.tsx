import React, { PropsWithChildren, ReactDOM } from 'react';
import './index.less';

interface PubModalContentProps {
  topNode: any;
  bottomNode: any;
  className?: string;
}

const PubModalContent = ({
  topNode,
  bottomNode,
  className,
}: PropsWithChildren<PubModalContentProps>) => {
  return (
    <div className={`pub-modal-content ${className}`}>
      <div className="pmc-top">{topNode}</div>
      <div className="pmc-bottom">{bottomNode}</div>
    </div>
  );
};

export default PubModalContent;
