import { observer } from 'mobx-react';

import { useTimelineStore } from '../../context';
import { calcTimeToPx } from '../../utils';
import globalStore from '../../store/globalStore';
import './index.less';

const AlignLines = () => {
  const { alignLines } = useTimelineStore();
  const global = globalStore;
  const { metaScaleWidth } = global;

  return (
    <>
      {alignLines.map(line => (
        <div
          className="timeline-align-line"
          key={line}
          style={{
            left: calcTimeToPx(line, metaScaleWidth),
          }}
        />
      ))}
    </>
  );
};

export default observer(AlignLines);
