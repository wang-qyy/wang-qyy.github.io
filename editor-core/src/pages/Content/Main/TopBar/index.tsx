import { useMemo, useState, useEffect } from 'react';
import { useSize } from 'ahooks';

import XiuIcon from '@/components/XiuIcon';
import LoginAlert from '@/pages/GlobalMobal/LoginTips';

import TopToolBar from '@/pages/TopToolBar';

import './index.less';
import { stopPropagation } from '@/utils/single';

const range = 300;

const TopBar = () => {
  const [translateX, setTranslateX] = useState(0);

  const { width: containerWidth = 0 } = useSize(
    document.querySelector('.xiudodo-topBar') as HTMLDivElement,
  );
  const { width: contentLeftWidth = 0 } = useSize(
    document.querySelector('.xiudd-tool-left') as HTMLDivElement,
  );
  const { width: contentRightWidth = 0 } = useSize(
    document.querySelector('.xiudd-tool-right') as HTMLDivElement,
  );

  const contentWidth = contentLeftWidth + contentRightWidth;

  const isScroll = useMemo(() => {
    if (containerWidth < contentWidth) {
      return true;
    }
    setTranslateX(0);
    return false;
  }, [containerWidth, contentWidth]);

  function changeTranslateX(x: number) {
    if (x > 0) {
      x = 0;
    } else if (x < containerWidth - contentWidth - 50) {
      x = containerWidth - contentWidth - 50;
    }

    setTranslateX(x);
  }

  return (
    <div className="xiudodo-topBar" onClick={stopPropagation}>
      <LoginAlert />

      <div
        className="xiudodo-topBar-content"
        id="xiudodo-topBar-content"
      // style={{ transform: `translateX(${translateX}px)` }}
      >
        <TopToolBar />
      </div>

      {/* <div
        className="xiudodo-topBar-arrow xiudodo-topBar-arrow-left"
        hidden={!translateX}
        onClick={() => changeTranslateX(translateX + range)}
      >
        <XiuIcon type="iconxiangzuo21" />
      </div> */}
      {/* <div
        className="xiudodo-topBar-arrow xiudodo-topBar-arrow-right"
        hidden={!isScroll || containerWidth - translateX >= contentWidth}
        onClick={() => changeTranslateX(translateX - range)}
      >
        <XiuIcon type="iconxiangzuo21" />
      </div> */}
    </div>
  );
};
export default TopBar;
