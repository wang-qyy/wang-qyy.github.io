import { useLayoutEffect, useRef } from 'react';

import globalStore from './store/globalStore';
import { GlobalProps } from './types';
import './index.less';

const TimeLine: React.FC<GlobalProps> = props => {
  const { children, scaleTime, scaleWidth, paddingLeft } = props;
  const { initOptions, initTimeLineWrapper } = globalStore;
  const timeLineWrapper = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    initOptions({
      scaleTime,
      scaleWidth,
      paddingLeft,
      // scroll,
    });
  }, [scaleTime, scaleWidth, paddingLeft]);

  useLayoutEffect(() => {
    timeLineWrapper.current && initTimeLineWrapper(timeLineWrapper.current);
  }, [timeLineWrapper]);

  return (
    // <GlobalContext.Provider value={value}>
    //   <div className="timeLine-wrapper">{children}</div>
    // </GlobalContext.Provider>
    <div ref={timeLineWrapper} className="timeLine-wrapper">
      {children}
    </div>
  );
};

export default TimeLine;
