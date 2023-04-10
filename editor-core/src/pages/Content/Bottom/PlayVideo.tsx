import XiuIcon from '@/components/XiuIcon';
import { observer, assetBlur } from '@hc/editor-core';

import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';
import { clickActionWeblog } from '@/utils/webLog';
import { stopPropagation } from '@/utils/single';

export default observer(() => {
  const { isPlaying, pauseVideo, playVideo } = useCanvasPlayHandler();
  return (
    <div
      className="xiudodo-bottom-play"
      onMouseDown={e => {
        stopPropagation(e);
        assetBlur();
        if (isPlaying) {
          pauseVideo();
          clickActionWeblog('bottom_template_pause');
        } else {
          clickActionWeblog('bottom_template_play');
          playVideo();
        }
      }}
    >
      <XiuIcon type={isPlaying ? 'iconzanting' : 'iconbofang'} />
    </div>
  );
});
