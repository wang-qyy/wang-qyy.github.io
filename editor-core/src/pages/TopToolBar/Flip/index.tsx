import classnames from 'classnames';
import {
  useImageClipByObserver,
  useHorizontalFlipByObserver,
  useVerticalFlipByObserver,
  observer,
} from '@hc/editor-core';
import XiuIcon from '@/components/XiuIcon';
import { clickActionWeblog } from '@/utils/webLog';
import { useBackgroundSet } from '@/hooks/useBackgroundSet';
import './index.less';

const Flip = ({ isBackground }: { isBackground: boolean }) => {
  const { endClip } = useImageClipByObserver();
  const {
    backHorizontalFlip,
    backVerticalFlip,
    updateBackHorizontalFlip,
    updateBackVerticalFlip,
  } = useBackgroundSet();
  const [horizontalFlip, updateHorizontalFlip] = useHorizontalFlipByObserver();
  const [verticalFlip, updateVerticalFlip] = useVerticalFlipByObserver();

  const horizontalFlipActive = isBackground
    ? backHorizontalFlip
    : horizontalFlip;
  const verticalFlipActive = isBackground ? backVerticalFlip : verticalFlip;

  // 水平翻转
  const bindUpdateHorizontalFlip = isBackground
    ? updateBackHorizontalFlip
    : updateHorizontalFlip;
  // 垂直翻转
  const bindUpdateVerticalFlip = isBackground
    ? updateBackVerticalFlip
    : updateVerticalFlip;

  return [
    {
      key: 'horizontalFlip',
      name: '水平翻转',
      icon: 'icongg_edit-flip-h',
      active: horizontalFlipActive,

      onClick: () => {
        endClip();
        bindUpdateHorizontalFlip(!horizontalFlipActive);
        clickActionWeblog('tool_horizontalFlip');
      },
    },
    {
      key: 'verticalFlip',
      name: '垂直翻转',
      icon: 'icongg_edit-flip-v',
      active: verticalFlipActive,
      onClick: () => {
        endClip();
        bindUpdateVerticalFlip(!verticalFlipActive);
        clickActionWeblog('tool_verticalFlip');
      },
    },
  ].map(item => (
    <div
      key={`flip-${item.key}`}
      className={classnames('popover-tool-item', {
        'popover-tool-item-active': item.active,
      })}
      onClick={item.onClick}
    >
      <XiuIcon className={classnames('xiuIcon', 'font-18')} type={item.icon} />
      {item.name}
    </div>
  ));
};

export default observer(Flip);
